# Changelog

All notable changes to the Bark & Build Lab project will be documented in this file.

## [1.5.1] - 2023-12-11

### Added
- Timeout handling for Google authentication to prevent indefinite loading
- Improved loading indicators for authentication processes
- Better toast notifications for authentication status

### Changed
- Enhanced Google authentication provider configuration
- Improved error handling with more specific error messages

### Fixed
- Fixed issue with Google sign-in getting stuck
- Resolved authentication timeout problems
- Improved error reporting for authentication failures

## [1.5.0] - 2023-12-10

### Added
- Automatic admin role assignment for configured admin email
- Improved admin detection and role assignment in Firestore

### Changed
- Switched to Google-only authentication (removed email/password authentication)
- Enhanced admin user experience with automatic role detection
- Updated documentation to reflect Google-only authentication

### Fixed
- Fixed issues with user creation in Firestore after authentication
- Improved error handling for Google authentication
- Enhanced logging for authentication processes

## [1.4.0] - 2023-12-05

### Added
- Centralized authentication service with improved Google authentication
- Enhanced error handling for authentication flows
- Additional Google OAuth scopes for better user profile data

### Changed
- Refactored authentication logic into a dedicated service
- Improved user data handling during sign-in and sign-up
- Enhanced type safety for authentication functions

### Fixed
- Fixed potential issues with Google authentication flow
- Improved error handling for authentication edge cases

## [1.3.0] - 2023-11-30

### Added
- Implemented caching system for workshop data to reduce loading times
- Added debouncing for search inputs to improve filter performance

### Changed
- Optimized React components with React.memo, useMemo, and useCallback
- Improved image loading with lazy loading for workshop cards
- Enhanced workshop filtering with more efficient state management
- Reduced animation complexity for better performance on mobile devices

### Fixed
- Fixed workshops not displaying on the workshops page when Firebase data is unavailable
- Improved fallback mechanism to use mock data when Firebase is unreachable

## [1.0.0] - 2023-11-15

### Added
- Initial release of the Bark & Build Lab workshop management application
- React and TypeScript frontend with Tailwind CSS for styling
- Firebase integration for authentication, database, and analytics
- Workshop listing and registration functionality
- User dashboard for tracking registered workshops
- Admin panel for managing users and workshops

## [1.1.0] - 2023-11-20

### Added
- Enhanced workshop cards with dynamic image loading and fallbacks
- Improved featured workshops section with better data handling
- Added analytics integration

### Changed
- Updated UI with more consistent styling
- Improved responsive design for mobile devices

### Fixed
- Fixed layout issues with duplicate headers and footers
- Resolved workshop data loading issues

## [1.2.0] - 2023-11-25

### Added
- Firebase configuration for production environment
- Proper environment variable setup for local and GCS environments

### Changed
- Simplified UI by removing theme toggle functionality
- Removed "Get in touch" link from header for cleaner design
- Updated README with detailed Firebase configuration information

### Fixed
- Fixed Firebase analytics initialization in browser environments
- Ensured consistent light theme application throughout the site 