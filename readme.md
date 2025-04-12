# Social Media App (MERN)

A full-stack social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The app allows users to register, log in, create posts, like, and comment on others' posts. Image uploads are handled via Cloudinary, and user authentication is secured using JWT.

## 🚧 Status

**In Progress** – Features are actively being developed and improved.

## 🔥 Features

- User registration and login (JWT authentication)
- Image upload with Cloudinary
- Create, update, delete posts
- Like and comment functionality
- MongoDB Aggregation for efficient data querying
- Email OTP verification for password reset *(Coming Soon)*

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, TypeScript *(Planned)*
- **Backend:** Node.js, Express.js (Dockerized)
- **Database:** MongoDB (with Aggregation Framework)
- **Authentication:** JWT
- **Image Hosting:** Cloudinary
- **Deployment:** Vercel (Frontend), Render (Backend via Docker)
- **Others:** Git, GitHub, Docker

## 📦 Deployment

The backend is deployed using a Docker image on Render:

**API Base URL:** [https://node-js-social-media-7t1g.onrender.com/](https://node-js-social-media-7t1g.onrender.com/)

## 📁 Folder Structure (Backend)

```
server/
├── public/
│   └── temp/                  # Temporary storage for uploads
├── src/
│   ├── controllers/           # Route logic handlers
│   ├── db/                    # Database connection and seeding
│   ├── middlewares/          # Express middleware (e.g., auth)
│   ├── models/                # Mongoose models
│   ├── routes/                # API route definitions
│   ├── services/
│   │   ├── email/             # Email service logic
│   │   ├── emailTemplate/     # Email template files
│   │   └── sms/               # SMS service logic
│   └── utils/                 # Helper utility functions
├── app.js                     # Express app configuration
├── constant.js                # App-wide constants
└── index.js                   # Entry point
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
```

### 4. Start development server
```bash
npm run dev
```

## 🔍 Test the API (Postman)

You can test the API using Postman:

**Postman Collection:** [Click to open](https://www.postman.com/cryosat-astronomer-35135276/workspace/my-workspace/collection/29595192-ed170205-442f-481c-815d-4de60cf35a66?action=share&creator=29595192)

### ✅ Steps to Test:
1. Open the Postman collection link.
2. Navigate to the `user` folder.
3. Use the `register` request (default values are pre-filled).
4. Use the `login` request.
5. Hit any other API from the collection.

## 🌐 Live Demo

Frontend coming soon…

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

