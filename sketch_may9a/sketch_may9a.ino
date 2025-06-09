#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// WiFi credentials
const char* ssid = "fauzi";
const char* password = "fauzi231104";

// API Key
const char* API_KEY = "smart-garden-2023";

// API Endpoints
const char* sensorApiUrl = "https://smartgarden-nine.vercel.app/api/sensor-data?key=smart-garden-2023";
const char* pumpControlApiUrl = "https://smartgarden-nine.vercel.app/api/pump-control?key=smart-garden-2023";

// Pin configurations
#define DHT_PIN 4
#define SOIL_MOISTURE_PIN 34
#define RELAY_PIN 5
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// Soil moisture thresholds
#define SOIL_WET 1500
#define SOIL_DRY 2000

// Status variables
bool manualPumpMode = false;
bool pumpStatus = false;
bool currentRelayState = false;
int soilMoisture = 0;
float temperature = 0;
float humidity = 0;

// Timing configurations - LEBIH CEPAT
const long sensorInterval = 1000;      // 2 detik
unsigned long previousSensorMillis = 0;
const long pollPumpInterval = 500;    // 1 detik
unsigned long previousPumpMillis = 0;
const int connectionTimeout = 5000;    // 5 detik

// Auto mode control
bool lastAutoPumpStatus = false;

// Error tracking
int consecutiveErrors = 0;
const int maxErrorsBeforeReconnect = 3;

// Pump control optimization
unsigned long lastRelayChange = 0;
const long relayMinChangeInterval = 100; // Minimal 0.5 detik antara perubahan relay

// For secure HTTPS connection
WiFiClientSecure secureClient;

void setup() {
  Serial.begin(115200);
  delay(500); // Lebih pendek
  
  Serial.println("\n\n==== SMART GARDEN SYSTEM ====");
  
  // Initialize with HIGHER priority
  // Initialize relay FIRST for responsiveness
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  currentRelayState = false;
  Serial.println("Relay initialized (OFF)");

  // Initialize sensor
  dht.begin();
  
  // Skip certificate verification for HTTPS
  secureClient.setInsecure();
  
  // Quick relay test - LEBIH CEPAT
  testRelay();
  
  // Connect to WiFi
  connectToWiFi();
}

// Tes relay lebih cepat
void testRelay() {
  Serial.println("Testing relay...");
  digitalWrite(RELAY_PIN, HIGH);
  currentRelayState = true;
  digitalWrite(RELAY_PIN, LOW);
  currentRelayState = false;
  Serial.println("Relay test complete");
}

void connectToWiFi() {
  Serial.println("\n----- CONNECTING TO WIFI -----");
  Serial.print("Connecting to: ");
  Serial.println(ssid);
  
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  int dots = 0;
  
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startTime < connectionTimeout) {
    delay(200); // Lebih cepat
    Serial.print(".");
    dots++;
    if (dots >= 20) {
      dots = 0;
      Serial.println();
    }
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    consecutiveErrors = 0;
  } else {
    Serial.println("\nWiFi connection failed! Running in offline mode.");
    WiFi.disconnect();
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Langsung periksa status pompa dari API (prioritas utama)
  if (currentMillis - previousPumpMillis >= pollPumpInterval && 
      WiFi.status() == WL_CONNECTED) {
    previousPumpMillis = currentMillis;
    pollPumpStatusFromApi();
    
    // Update relay berdasarkan status pompa yang baru dari API
    if (manualPumpMode) {
      controlRelay(pumpStatus);
    }
  }
  
  // Read sensors and send data
  if (currentMillis - previousSensorMillis >= sensorInterval) {
    previousSensorMillis = currentMillis;
    
    // Baca sensor
    readSensors();
    
    // Update kontrol pompa untuk AUTO mode
    if (!manualPumpMode) {
      updateAutoPumpStatus();
    }
    
    // Kirim data ke API jika connected
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorDataToApi();
    }
  }
  
  // Cek WiFi dan reconnect jika perlu - tidak prioritas
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
  
  // Tidak ada delay di sini untuk responsivitas maksimal
}

void readSensors() {
  // Baca suhu & kelembaban
  float newHumidity = dht.readHumidity();
  float newTemperature = dht.readTemperature();
  
  // Baca kelembaban tanah - lebih cepat (hanya 3 sampel)
  int soilSum = 0;
  for (int i = 0; i < 3; i++) {
    soilSum += analogRead(SOIL_MOISTURE_PIN);
  }
  int newSoilMoisture = soilSum / 3;
  
  // Validasi bacaan DHT
  if (isnan(newHumidity) || isnan(newTemperature)) {
    Serial.println("ERROR: Failed to read from DHT sensor!");
  } else {
    // Update nilai global
    humidity = newHumidity;
    temperature = newTemperature;
    soilMoisture = newSoilMoisture;
    
    // Log data
    Serial.println("\n----- SENSOR READINGS -----");
    Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" °C");
    Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
    Serial.print("Soil Moisture: "); Serial.print(soilMoisture);
    
    if (soilMoisture < SOIL_WET) {
      Serial.println(" (WET)");
    } else if (soilMoisture > SOIL_DRY) {
      Serial.println(" (DRY)");
    } else {
      Serial.println(" (OPTIMAL)");
    }
  }
}

// Fungsi kontrol relay yang lebih responsif
void controlRelay(bool shouldBeOn) {
  // Hanya ubah relay jika perlu dan tidak terlalu sering
  if (currentRelayState != shouldBeOn) {
    digitalWrite(RELAY_PIN, shouldBeOn ? HIGH : LOW);
    currentRelayState = shouldBeOn;
    lastRelayChange = millis();
    
    Serial.print("RELAY CHANGED to ");
    Serial.println(shouldBeOn ? "ON" : "OFF");
  }
}

// Fungsi untuk update pompa di mode AUTO
void updateAutoPumpStatus() {
  // Mode AUTO: kontrol berdasarkan kelembaban tanah
  if (soilMoisture > SOIL_DRY && !lastAutoPumpStatus) {
    // Nyalakan jika tanah KERING dan pompa saat ini OFF
    lastAutoPumpStatus = true;
    pumpStatus = true;
  } else if (soilMoisture < SOIL_WET && lastAutoPumpStatus) {
    // Matikan jika tanah BASAH dan pompa saat ini ON
    lastAutoPumpStatus = false;
    pumpStatus = false;
  }
  
  // Kontrol relay
  controlRelay(lastAutoPumpStatus);
  
  Serial.print("AUTO Mode - Pump Status: ");
  Serial.println(lastAutoPumpStatus ? "ON" : "OFF");
}

void sendSensorDataToApi() {
  HTTPClient http;
  http.begin(secureClient, sensorApiUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // Lebih cepat
  
  // Buat JSON payload
  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilMoisture"] = soilMoisture;
  doc["pumpStatus"] = currentRelayState ? 1 : 0; // Gunakan status relay aktual
  
  String payload;
  serializeJson(doc, payload);
  
  // Kirim data tanpa print terlalu banyak
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("Sent data successfully");
    consecutiveErrors = 0;
    
    // Cek respon untuk modus auto
    StaticJsonDocument<256> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);
    if (!error && !manualPumpMode) {
      // Dalam mode otomatis, kita bisa menggunakan feedback dari server
      if (respDoc.containsKey("pumpStatus")) {
        int apiPumpStatus = respDoc["pumpStatus"];
        // Dapat dipertimbangkan jika ingin mengikuti status dari server
      }
    }
  } else {
    Serial.print("API POST failed: ");
    Serial.println(httpResponseCode);
    consecutiveErrors++;
  }
  
  http.end();
}

void pollPumpStatusFromApi() {
  HTTPClient http;
  http.begin(secureClient, pumpControlApiUrl);
  http.setTimeout(3000); // Lebih cepat
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Parse JSON
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      bool newPumpStatus = (doc.containsKey("pumpStatus") && doc["pumpStatus"] == 1);
      bool newManualMode = (doc.containsKey("manual") && doc["manual"] == true);
      
      // Segera terapkan perubahan ke relay
      if (newManualMode) {
        if (pumpStatus != newPumpStatus || manualPumpMode != newManualMode) {
          Serial.println("** CONTROL MODE/STATUS CHANGED **");
          Serial.print("Manual Pump Status: ");
          Serial.println(newPumpStatus ? "ON" : "OFF");
          
          // Kontrol relay dengan pumpStatus baru
          controlRelay(newPumpStatus);
        }
      } else if (manualPumpMode && !newManualMode) {
        // Switching from manual to auto
        Serial.println("** SWITCHING TO AUTO MODE **");
      }
      
      // Simpan status kontrol baru
      pumpStatus = newPumpStatus;
      manualPumpMode = newManualMode;
      
      consecutiveErrors = 0;
    } else {
      Serial.print("JSON parsing error: ");
      Serial.println(error.c_str());
      consecutiveErrors++;
    }
  } else {
    Serial.print("Failed to poll pump status: ");
    Serial.println(httpResponseCode);
    consecutiveErrors++;
  }
  
  http.end();
}