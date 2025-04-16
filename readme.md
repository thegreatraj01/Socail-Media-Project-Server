# Social Media App (MERN + Socket.io)

A full-stack social media web application built using the MERN stack with real-time chat functionality. The app includes user authentication, post creation, interactions, and now features real-time messaging powered by Socket.io.

## 🚧 Status

**In Progress** – Actively adding new features including enhanced real-time functionality.

## 🔥 Features

### Core Features
- User registration and login (JWT authentication)
- Image upload with Cloudinary
- Create, update, delete posts
- Like and comment functionality
- MongoDB Aggregation for efficient data querying
- Email OTP verification for password reset *(Coming Soon)*

### New Real-time Features
- Real-time chat using Socket.io
- Typing indicators 
- Online status tracking *(Coming Soon)*
- Message read receipts *(Coming Soon)*

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, TypeScript *(Planned)*
- **Backend:** Node.js, Express.js (Dockerized)
- **Real-time:** Socket.io
- **Database:** MongoDB (with Aggregation Framework)
- **Authentication:** JWT
- **Image Hosting:** Cloudinary
- **Deployment:** Vercel (Frontend), Render (Backend via Docker)
- **Others:** Git, GitHub, Docker

## 📦 Deployment

The backend is deployed using a Docker image on Render:

**API Base URL:** [https://node-js-social-media-7t1g.onrender.com/](https://node-js-social-media-7t1g.onrender.com/)

**WebSocket URL:** `wss://node-js-social-media-7t1g.onrender.com`

## 📁 Updated Folder Structure (Backend)

```
server/
├── public/
│   └── temp/                  # Temporary storage for uploads
├── src/
│   ├── controllers/           # Route logic handlers
│   │   └── chatController.js  # New chat controller
│   ├── db/                    # Database connection and seeding
│   ├── middlewares/           # Express middleware (e.g., auth)
│   ├── models/                # Mongoose models
│   │   └── chatModel.js       # New chat models
│   ├── routes/                # API route definitions
│   │   └── chatRoutes.js      # New chat routes
│   ├── services/
│   │   ├── email/             # Email service logic
│   │   ├── emailTemplate/     # Email template files
│   │   ├── sms/               # SMS service logic
│   │   └── socket/            # Socket.io service logic
│   └── utils/                 # Helper utility functions
├── app.js                     # Express app configuration
├── constant.js                # App-wide constants
├── index.js                   # Entry point (now with Socket.io setup)
└── socket.js                  # Socket.io configuration
```

## 🧪 Run Locally

### 1. Clone the backend repo
```bash
git clone https://github.com/thegreatraj01/Socail-Media-Project-Server.git
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file (use `.env.sample` as reference)
```env
MONGO_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SOCKET_PORT=your_socket_port # Optional, defaults to 8001
```

### 4. Start development server
```bash
npm run dev
```

## 🔍 Test the API (Postman)

You can test the API using Postman:

**Postman Collection:** [Click to open](https://www.postman.com/cryosat-astronomer-35135276/workspace/my-workspace/collection/29595192-ed170205-442f-481c-815d-4de60cf35a66?action=share&creator=29595192)

### New Chat Endpoints:
- `POST /api/chat` - Create new chat
- `GET /api/chat/:userId` - Get user chats
- `GET /api/message/:chatId` - Get chat messages
- `POST /api/message` - Send new message

## 🌐 Live Demo
https://node-js-social-media-7t1g.onrender.com/chat.html

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

## 🚀 Future Plans
- Implement group chats
- Add message reactions
- Implement file sharing in chats
- Voice/video calling integration

---