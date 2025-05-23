# Discussion Forum Backend

This is the backend server for the Discussion Forum application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/discussion-forum
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Make sure MongoDB is running on your system

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)

### Posts
- GET `/api/posts` - Get all posts
- POST `/api/posts` - Create a new post (protected)
- GET `/api/posts/:id` - Get a specific post
- PUT `/api/posts/:id` - Update a post (protected)
- DELETE `/api/posts/:id` - Delete a post (protected)

### Comments
- GET `/api/posts/:id/comments` - Get comments for a post
- POST `/api/posts/:id/comments` - Add a comment (protected)
- PUT `/api/comments/:id` - Update a comment (protected)
- DELETE `/api/comments/:id` - Delete a comment (protected)

### Users
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/:id` - Update user profile (protected)

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 