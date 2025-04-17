
---

# Social Media App (MERN + Socket.io)

A full-stack social media web application built using the **MERN stack** with **real-time chat functionality**. The app includes user authentication, post creation, interactions, and now features secure password reset via email.

---

## 🚧 Status

**In Progress** – Actively adding new features including enhanced real-time functionality and improved security features.

---

## 🔥 Features

### Core Features
- User registration and login with **JWT authentication**
- Image upload with **Cloudinary**
- Create, update, delete posts
- Like and comment functionality
- MongoDB Aggregation for efficient querying
- ✅ **Password reset via OTP** using MailerSend (with confirmation email after successful reset)

### Real-time Features
- Real-time chat using **Socket.io**
- Typing indicators 
- Online status tracking *(Coming Soon)*
- Message read receipts *(Coming Soon)*

---

## ✉️ New: Email-based Password Reset (via OTP)

- Integrated **MailerSend** for sending emails via a verified domain.
- Purchased and configured domain 👉 `rajballavkumar.fun` to send branded, authenticated emails.
- Two-step flow:
  1. **Send OTP** email for password reset (valid for 10 mins).
  2. **Send confirmation** email after successful password change.

MailerSend was chosen for:
- Developer-friendly SDK
- Easy domain authentication
- Free tier with enough monthly quota
- Clean and reliable email delivery

---

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, TypeScript *(Planned)*
- **Backend:** Node.js, Express.js (Dockerized)
- **Real-time:** Socket.io
- **Database:** MongoDB (Aggregation Framework)
- **Authentication:** JWT
- **Image Hosting:** Cloudinary
- **Email Service:** MailerSend
- **Deployment:** Vercel (Frontend), Render (Backend via Docker)
- **Others:** Git, GitHub, Docker

---

## 📦 Deployment

The backend is deployed using a Docker image on Render:

- **API Base URL:** [https://node-js-social-media-7t1g.onrender.com](https://node-js-social-media-7t1g.onrender.com)
- **WebSocket URL:** `wss://node-js-social-media-7t1g.onrender.com`

---

## 📁 Folder Structure (Backend)

```
server/
├── public/
│   └── temp/
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── email/             # OTP + confirmation email logic
│   │   ├── emailTemplate/
│   │   ├── sms/
│   │   └── socket/
│   └── utils/
├── app.js
├── constant.js
├── index.js
└── socket.js
```

---

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
MAILERSEND_API_KEY=your_mailersend_api_key
```

### 4. Start development server
```bash
npm run dev
```

---

## 🔍 Test the API (Postman)

You can test the API using Postman:

📦 **Postman Collection:** [Open Postman Collection](https://www.postman.com/cryosat-astronomer-35135276/workspace/my-workspace/collection/29595192-ed170205-442f-481c-815d-4de60cf35a66?action=share&creator=29595192)

### Notable Endpoints:
- `POST /api/auth/send-otp` – Send password reset OTP
- `POST /api/auth/reset-password` – Reset password using OTP
- `POST /api/chat` – Create chat
- `GET /api/chat/:userId` – Get user chats
- `GET /api/message/:chatId` – Get chat messages
- `POST /api/message` – Send message

---

## 🌐 Live Demo

Check out the chat module in action:  
🔗 [https://node-js-social-media-7t1g.onrender.com/chat.html](https://node-js-social-media-7t1g.onrender.com/chat.html)

---

## 🚀 Future Plans

- Implement group chats
- Add message reactions
- File sharing in chats
- Voice/video calling integration
- **Rate limiting on OTP endpoint**
- **Forgot password via phone (SMS)**
- Admin dashboard for user/report management

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue to discuss the approach first.

---
