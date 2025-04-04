Here’s the updated `README.md` content based on your latest inputs — the backend is in a separate repo, the frontend will be in another, and MongoDB aggregation is included:

---

```md
# Social Media App (MERN)

A full-stack social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The app allows users to register, log in, create posts, like, and comment on others' posts. Image uploads are handled via Cloudinary, and user authentication is secured using JWT.

---

## 🚧 Status

**In Progress** – Features are being developed and improved.

---

## 🔥 Features

- User registration and login (JWT authentication)
- Image upload with Cloudinary
- Create, update, delete posts
- Like and comment functionality
- MongoDB Aggregation for efficient data querying
- Email OTP verification for password reset *(Coming Soon)*

---

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, TypeScript *(Planned)*
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Aggregation Framework)
- **Authentication:** JWT
- **Image Hosting:** Cloudinary
- **Deployment:** Vercel (Frontend), Render (Backend)
- **Others:** Git, GitHub

---

```
## 📁 Folder Structure (Backend Only)

```
server/
├── public/
│   └── temp/
└── src/
    ├── controllers/
    ├── db/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── services/
    │   ├── email/
    │   ├── emailTemplate/
    │   └── sms/
    └── utils/
    app.js
│   constant.js
│   index.js
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

### 3. Create `.env` file
```
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

---

## 🌐 Live Demo

Coming soon…

---

<!-- ## 📷 Screenshots -->

<!-- *(Add screenshots here when available)* -->

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---
