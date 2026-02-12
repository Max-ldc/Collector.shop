# Proof Of Concept (POC) Frontend Application

This project is a frontend application designed to test the backend for a Proof Of Concept (POC) application. It includes user authentication via Keycloak, a list of validated articles, a "Sell" form for users with seller and admin roles, and an admin back office for managing articles.

## Features

- **User Authentication**: Users can log in using Keycloak. The application manages user sessions and roles.
- **Article List**: Displays a list of validated articles accessible to all users.
- **Sell Form**: Authenticated users with seller or admin roles can create new articles through a dedicated form.
- **Admin Dashboard**: Admin users have access to a dashboard for managing articles, including validating or rejecting pending articles.

## Project Structure

```
frontend
├── src
│   ├── main.tsx
│   ├── App.tsx
│   ├── components
│   │   ├── auth
│   │   │   ├── Login.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── articles
│   │   │   ├── ArticleList.tsx
│   │   │   └── ArticleCard.tsx
│   │   ├── seller
│   │   │   └── SellForm.tsx
│   │   └── admin
│   │       ├── AdminDashboard.tsx
│   │       └── ArticleManagement.tsx
│   ├── services
│   │   ├── auth.service.ts
│   │   ├── articles.service.ts
│   │   └── keycloak.service.ts
│   ├── hooks
│   │   ├── useAuth.ts
│   │   └── useArticles.ts
│   ├── types
│   │   ├── auth.types.ts
│   │   └── article.types.ts
│   ├── layouts
│   │   ├── MainLayout.tsx
│   │   └── AdminLayout.tsx
│   └── utils
│       └── api.ts
├── public
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage Guidelines

- Ensure you have a Keycloak server running and configured for user authentication.
- Users can log in using the provided login form.
- Admin users can access the admin dashboard to manage articles.
- Sellers can submit new articles through the Sell form.

## License

This project is licensed under the MIT License.