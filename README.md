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
3. The project includes pre-configured environment files:
   - `.env.local` - For local development with Firebase integration
   - `.env.production` - For production deployment

4. Start the development server:
   ```
   npm run dev
   ```

### Firebase Configuration

The application is configured to use the following Firebase project:

```
Project ID: barkbuild-45559
```

Firebase services used:
- Authentication (Email/Password and Google providers)
- Firestore Database
- Analytics

#### Authentication Setup

The application uses Firebase Authentication with the following configuration:

- **Google Authentication Only**: Users can only sign in with their Google accounts. Email/password authentication has been disabled.
- **OAuth Scopes**:
  - `https://www.googleapis.com/auth/userinfo.profile` - For user profile information
  - `https://www.googleapis.com/auth/userinfo.email` - For user email

New users are automatically created in Firestore upon their first sign-in with Google.

### Admin Access

Admin access is controlled by the `VITE_ADMIN_EMAIL` environment variable. The email address specified in this variable will automatically be granted admin privileges when they sign in with Google.

To set an admin email:

1. Add or update the `VITE_ADMIN_EMAIL` variable in your `.env.local` file:
   ```
   VITE_ADMIN_EMAIL=your-admin-email@example.com
   ```

2. When a user with this email signs in via Google, they will automatically be assigned the admin role in Firestore.

3. Admin users have access to the admin dashboard at `/admin` where they can manage workshops and users.

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

The production environment is pre-configured in `.env.production` with the following Firebase project details:

```
Project ID: barkbuild-45559
Auth Domain: barkbuild-45559.firebaseapp.com
Storage Bucket: barkbuild-45559.firebasestorage.app
```

## GCP Deployment

### Cloud Run Deployment

1. Build and push the Docker image to Google Container Registry:
   ```bash
   gcloud builds submit --tag gcr.io/barkbuild-45559/bark-build-lab
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy bark-build-lab \
     --image gcr.io/barkbuild-45559/bark-build-lab \
     --platform managed \
     --allow-unauthenticated
   ```

   Note: Environment variables are already configured in the Docker image from `.env.production`.

## Firebase Setup

1. The Firebase project is already set up at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Authentication is enabled with Email/Password and Google providers
3. Firestore database is configured
4. Security rules are defined in `firebase.rules`

## Authentication Flow

1. Users can sign up or log in from the `/login` or `/signup` pages
2. Authentication state is managed through Redux and persisted with Firebase Auth
3. User data is stored in Firestore with the following structure:
   ```
   users/{userId}
     - name: string
     - email: string
     - photoURL: string (optional)
     - role: 'student' | 'instructor' | 'admin'
     - registeredWorkshops: string[] (workshop IDs)
     - completedWorkshops: string[] (workshop IDs)
     - createdAt: timestamp
   ```
4. Protected routes require authentication and redirect to the login page if the user is not authenticated

## Admin Access

The admin hub is available at `/admin` and is only accessible to users with the admin role. When using mock data, the user with the email specified in `VITE_ADMIN_EMAIL` will automatically have admin access.

In the admin hub, you can:
- View and manage all registered users
- Change user roles (student, instructor, admin)
- View all workshops and their details
- See which users are registered for each workshop
