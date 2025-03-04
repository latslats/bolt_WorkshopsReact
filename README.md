# Bark & Build Lab

A workshop management application built with React, TypeScript, and Firebase.

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Set to true to use mock data instead of Firebase
   VITE_USE_MOCK_DATA=true
   
   # Default admin email
   VITE_ADMIN_EMAIL=julio.v@earthrated.com
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Using Mock Data

For local development without Firebase, set `VITE_USE_MOCK_DATA=true` in your `.env.local` file. This will use the mock data provided in `src/utils/mockData.ts` instead of connecting to Firebase.

The default admin user email is set to `julio.v@earthrated.com` and can be changed using the `VITE_ADMIN_EMAIL` environment variable.

## Docker Setup

### Building the Docker Image

```bash
docker build -t bark-build-lab .
```

### Running the Container

```bash
docker run -p 80:80 bark-build-lab
```

### Environment Variables for Production

For production deployment, you'll need to set the following environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_USE_MOCK_DATA` (set to "false" for production)
- `VITE_ADMIN_EMAIL`

## GCP Deployment

### Cloud Run Deployment

1. Build and push the Docker image to Google Container Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/bark-build-lab
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy bark-build-lab \
     --image gcr.io/YOUR_PROJECT_ID/bark-build-lab \
     --platform managed \
     --allow-unauthenticated \
     --set-env-vars="VITE_FIREBASE_API_KEY=your_api_key,VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain,..."
   ```

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Deploy the security rules from `firebase.rules`
5. Add your application to the Firebase project and get the configuration values for your environment variables

## Admin Access

The admin hub is available at `/admin` and is only accessible to users with the admin role. When using mock data, the user with the email specified in `VITE_ADMIN_EMAIL` will automatically have admin access.

In the admin hub, you can:
- View and manage all registered users
- Change user roles (student, instructor, admin)
- View all workshops and their details
- See which users are registered for each workshop
