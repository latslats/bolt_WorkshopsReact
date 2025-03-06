#!/bin/bash

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
firebase login

# Deploy only the Firestore security rules
echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo "Deployment complete!" 