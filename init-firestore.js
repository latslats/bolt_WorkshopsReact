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

    // Create sample users
    const users = [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];

    // Add sample users to Firestore
    for (const user of users) {
      await setDoc(doc(db, 'users', user.id), user);
    }
    console.log('Created users collection with sample users');

    // Create a sample workshop with registrations, attendance, schedule and prerequisites
    await setDoc(doc(db, 'workshops', 'sample-workshop'), {
      title: 'React Fundamentals Workshop',
      description: 'This comprehensive workshop covers React fundamentals from the ground up. Learn component-based architecture, state management, hooks, and best practices for building modern web applications.',
      instructor: 'Jane Instructor',
      date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 2 weeks from now
      sessions: 3,
      level: 'Beginner',
      tags: ['react', 'javascript', 'frontend'],
      capacity: 20,
      registered: 3,
      registrations: ['user1', 'user2', 'user3'],
      attendance: ['user1', 'user2'],
      materials: [
        'React Fundamentals PDF Guide',
        'Component Patterns Cheat Sheet',
        'GitHub Repository with Starter Code'
      ],
      imageUrl: 'https://via.placeholder.com/800x400?text=React+Workshop',
      prerequisites: [
        'Basic JavaScript knowledge (variables, functions, arrays)',
        'Familiarity with HTML and CSS',
        'A laptop with Node.js installed (v14+ recommended)',
        'Code editor (VS Code recommended)'
      ],
      schedule: [
        {
          time: '9:00 AM - 10:30 AM',
          title: 'Introduction to React and Component Basics',
          description: 'Overview of React, JSX syntax, component structure, and props. We\'ll build our first component and understand the component lifecycle.'
        },
        {
          time: '10:45 AM - 12:15 PM',
          title: 'State Management and Hooks',
          description: 'Deep dive into React state, useState, useEffect, and other essential hooks. Learn how to manage component state effectively.'
        },
        {
          time: '1:30 PM - 3:00 PM',
          title: 'Building a Complete Application',
          description: 'Put everything together by building a small but complete React application. We\'ll implement routing, forms, and connect to an API.'
        },
        {
          time: '3:15 PM - 4:30 PM',
          title: 'Advanced Patterns and Best Practices',
          description: 'Explore advanced React patterns, performance optimization, and deployment strategies. Q&A session to address specific questions.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create a second workshop
    await setDoc(doc(db, 'workshops', 'advanced-workshop'), {
      title: 'Advanced Node.js Development',
      description: 'Take your Node.js skills to the next level with this advanced workshop. Learn about performance optimization, security best practices, microservices architecture, and real-time applications.',
      instructor: 'Michael Johnson',
      date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // 1 month from now
      sessions: 2,
      level: 'Advanced',
      tags: ['nodejs', 'backend', 'javascript'],
      capacity: 15,
      registered: 2,
      registrations: ['user1', 'user3'],
      attendance: [],
      materials: [
        'Advanced Node.js Architecture Guide',
        'Performance Tuning Handbook',
        'Security Best Practices Checklist'
      ],
      imageUrl: 'https://via.placeholder.com/800x400?text=Node.js+Workshop',
      prerequisites: [
        'Solid understanding of JavaScript and Node.js basics',
        'Experience building at least one Node.js application',
        'Familiarity with npm and package management',
        'Basic understanding of databases (SQL or NoSQL)'
      ],
      schedule: [
        {
          time: '9:00 AM - 12:00 PM',
          title: 'Performance Optimization and Scalability',
          description: 'Learn techniques for optimizing Node.js applications, including clustering, worker threads, memory management, and caching strategies.'
        },
        {
          time: '1:00 PM - 4:00 PM',
          title: 'Security and Best Practices',
          description: 'Deep dive into security vulnerabilities, authentication strategies, authorization patterns, and secure coding practices for Node.js applications.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Created workshops collection with sample workshops including schedule and prerequisites');

    console.log('Firestore collections initialized successfully!');
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
  }
}

initializeFirestore(); 