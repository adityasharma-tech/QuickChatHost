# QuickChatHost

QuickChatHost is the backend server for the QuickChat application. It handles user authentication, real-time messaging, contact synchronization, and more.

## Features

- **User Authentication**: Secure user authentication using JWT.
- **Real-time Messaging**: Real-time messaging using [Socket.IO](https://socket.io/).
- **Contact Synchronization**: Sync contacts with the server.
- **Push Notifications**: Send push notifications using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging).
- **Media Upload**: Upload and manage media files using Cloudinary.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 18)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/QuickChatHost.git
   cd QuickChatHost
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```env
   SERVER_URL=your_server_url
   MONGODB_URI=your_mongodb_uri
   REDIS_HOST=your_redis_host
   REDIS_PASSWORD=your_redis_password
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=your_access_token_expiry
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
   MSG91_ENDPOINT=your_msg91_endpoint
   MSG91_AUTH_KEY=your_msg91_auth_key
   FIREBASE_TYPE=your_firebase_type
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_CLIENT_ID=your_firebase_client_id
   FIREBASE_AUTH_URI=your_firebase_auth_uri
   FIREBASE_TOKEN_URI=your_firebase_token_uri
   FIREBASE_AUTH_PROVIDER_CERT_URL=your_firebase_auth_provider_cert_url
   FIREBASE_CLIENT_CERT_URL=your_firebase_client_cert_url
   ```

4. **Run the server:**

   ```bash
   npm start
   ```

## Folder Structure

- **controllers**: Contains the logic for handling requests.
- **middleware**: Middleware functions for request processing.
- **models**: Mongoose models for MongoDB.
- **routes**: API routes.
- **utils**: Utility functions and classes.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
