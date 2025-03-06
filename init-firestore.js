import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeFirestore() {
  try {
    console.log('Initializing Firestore collections...');

    // Create system_health_checks collection with a test document
    await setDoc(doc(db, 'system_health_checks', 'connection_test'), {
      lastCheck: new Date().toISOString(),
      status: 'online'
    });
    console.log('Created system_health_checks collection');

    // Create _connection_test collection with a test document
    await setDoc(doc(db, '_connection_test', 'test'), {
      lastCheck: new Date().toISOString(),
      status: 'online'
    });
    console.log('Created _connection_test collection');

    // Create a sample workshop
    await setDoc(doc(db, 'workshops', 'sample-workshop'), {
      title: 'Sample Workshop',
      description: 'This is a sample workshop for testing',
      date: new Date().toISOString(),
      location: 'Online',
      capacity: 20,
      registeredCount: 0,
      imageUrl: 'https://via.placeholder.com/300',
      createdAt: new Date().toISOString()
    });
    console.log('Created workshops collection with a sample workshop');

    console.log('Firestore collections initialized successfully!');
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
  }
}

initializeFirestore(); 