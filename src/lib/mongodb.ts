import { MongoClient, MongoClientOptions } from 'mongodb';

// Tipe yang tepat untuk koneksi client
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Cek environment variable
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local or .env');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Di mode development, gunakan variabel global sehingga nilai
  // tetap dipertahankan saat terjadi reload module karena HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Di mode production, sebaiknya tidak menggunakan variabel global
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;