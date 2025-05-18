#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi credentials
const char* ssid = "fh_f35a00";
const char* password = "wlan0ca5ff";

// API Endpoints (GANTI sesuai server Next.js kamu!)
const char* sensorApiUrl = "http://192.168.1.8:3000/api/sensor-data";
const char* pumpControlApiUrl = "http://192.168.1.8:3000/api/pump-control";

#define DHT_PIN 4
#define SOIL_MOISTURE_PIN 34
#define RELAY_PIN 23
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

#define SOIL_WET 1500   // Batas tanah basah
#define SOIL_DRY 2000   // Batas tanah kering

// Mode manual/otomatis
bool manualPumpMode = false; // false = auto, true = manual (set via API)
bool pumpStatus = false;     // Pompa ON/OFF
int soilMoisture = 0;
float temperature = 0;
float humidity = 0;

const long interval = 5000; // interval kirim data (ms)
unsigned long previousMillis = 0;
const long pollPumpInterval = 3000; // interval cek status pompa dari API
unsigned long previousPumpMillis = 0;

// Untuk menghindari relay sering nyala-mati di batas threshold
bool lastAutoPumpStatus = false;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("WiFi Connected");
}

void loop() {
  unsigned long currentMillis = millis();

  // Poll status pompa dari API (manual/otomatis)
  if (currentMillis - previousPumpMillis >= pollPumpInterval) {
    previousPumpMillis = currentMillis;
    pollPumpStatusFromApi();
  }

  // Baca sensor & kirim data
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    readSensorsAndSend();
  }

  // Kontrol relay sesuai mode
  if (manualPumpMode) {
    // Mode manual: relay sesuai pumpStatus dari API
    digitalWrite(RELAY_PIN, pumpStatus ? HIGH : LOW);
  } else {
    // Mode otomatis: relay sesuai auto logic, status diatur di readSensorsAndSend
    digitalWrite(RELAY_PIN, lastAutoPumpStatus ? HIGH : LOW);
  }
}

void readSensorsAndSend() {
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();
  soilMoisture = analogRead(SOIL_MOISTURE_PIN);

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Gagal membaca sensor DHT22!");
    return;
  }

  // Mode otomatis: Pompa nyala terus jika kering, mati setelah tanah cukup basah
  if (!manualPumpMode) {
    if (!lastAutoPumpStatus && soilMoisture > SOIL_DRY) {
      // Baru ON kalau sebelumnya OFF dan tanah kering
      lastAutoPumpStatus = true;
      Serial.println("Pompa otomatis: ON (tanah kering)");
    } else if (lastAutoPumpStatus && soilMoisture < SOIL_WET) {
      // Baru OFF kalau sebelumnya ON dan tanah sudah cukup basah
      lastAutoPumpStatus = false;
      Serial.println("Pompa otomatis: OFF (tanah basah)");
    }
    // pumpStatus hanya untuk laporan ke API
    pumpStatus = lastAutoPumpStatus;
  }
  // Jika manual, pumpStatus diatur API, lastAutoPumpStatus tidak dipakai

  sendSensorDataToApi();
}

void sendSensorDataToApi() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(sensorApiUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"temperature\":" + String(temperature, 1) + ",";
    payload += "\"humidity\":" + String(humidity, 1) + ",";
    payload += "\"soilMoisture\":" + String(soilMoisture) + ",";
    payload += "\"pumpStatus\":" + String(pumpStatus ? 1 : 0);
    payload += "}";

    int httpResponseCode = http.POST(payload);
    Serial.print("POST /api/sensor-data: ");
    Serial.println(httpResponseCode);
    http.end();
  }
}

// Fungsi polling status pompa dari API
void pollPumpStatusFromApi() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(pumpControlApiUrl);
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String response = http.getString();
      // Contoh response: {"pumpStatus":1,"manual":true}
      int pumpIdx = response.indexOf("\"pumpStatus\":");
      int manualIdx = response.indexOf("\"manual\":");
      if (pumpIdx != -1 && manualIdx != -1) {
        int pumpVal = response.substring(pumpIdx + 12, response.indexOf(",", pumpIdx)).toInt();
        int manualVal = response.substring(manualIdx + 9, response.indexOf("}", manualIdx)).toInt();
        manualPumpMode = (manualVal == 1);
        // Hanya update pumpStatus jika mode manual
        if (manualPumpMode) {
          pumpStatus = (pumpVal == 1);
        }
        Serial.print("PumpStatus (from API): "); Serial.println(pumpStatus);
        Serial.print("Manual mode (from API): "); Serial.println(manualPumpMode);
      }
    } else {
      Serial.print("Failed to poll pump status: "); Serial.println(httpResponseCode);
    }
    http.end();
  }
}