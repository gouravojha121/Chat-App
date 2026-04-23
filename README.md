# 💬 CHAT APP

> A full-stack real-time chat application built with the MERN stack and Socket.io.  
> Made with ❤️ as a learning project.

link - (https://chat-app-wine-rho.vercel.app)

## 🌐 Live Demo

Link:

|  Frontend | [chat-app-wine-rho.vercel.app](https://chat-app-wine-rho.vercel.app) |
|  Backend | [chat-app-7qcm.onrender.com](https://chat-app-7qcm.onrender.com) |

---

##  Features

- Email Login Mode — Register/Login with email, persistent chat history, contacts list, online/offline status
- Anonymous Mode — No signup needed, create or join rooms by Room ID, no data saved
- Real-Time Messaging — Powered by Socket.io
- Typing Indicators — See when someone is typing
- Online Presence — See who is online in real time
- Mobile Responsive — Works on all screen sizes
- Beautiful Dark UI — Modern design with smooth animations

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI Library |
| React Router DOM | Page Navigation |
| Socket.io Client | Real-time communication |
| Axios | API requests |
| CSS3 | Styling & Animations |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| Socket.io | Real-time events |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Bcrypt.js | Password hashing |
| CORS | Cross-origin requests |

---
## 📱 How to Use

### Mode 1 — Email Chat
1. Click **"Login with Email"**
2. Register a new account
3. Search for other users and add them as contacts
4. Click on a contact and start chatting!
5. Chat history is saved — messages available even after going offline

### Mode 2 — Anonymous Room
1. Click **"Go Anonymous"**
2. Pick a username or generate a random one
3. **Create a Room** — a unique Room ID is generated
4. Share the Room ID with friends
5. Friends click **"Join Room"** and enter the Room ID
6. Chat in real time — no data saved, history clears when you leave

++++++++++++++++

## 📁 Project Structure
chatapp/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Home.js         # Landing page
│       │   ├── Auth/
│       │   │   └── Auth.js     # Login & Register
│       │   ├── Chat/
│       │   │   └── Chat.js     # Mode 1: Email chat
│       │   └── Anonymous/
│       │       └── Anonymous.js # Mode 2: Room chat
│       ├── context/
│       │   └── AuthContext.js  # User state management
│       ├── hooks/
│       │   └── useSocket.js    # Socket.io singleton
│       └── App.js              # Routes
│
└── server/                 # Node.js Backend
├── config/
│   └── db.js               # MongoDB connection
├── middleware/
│   └── auth.js             # JWT middleware
├── models/
│   ├── User.js             # User schema
│   └── Message.js          # Message schema
├── routes/
│   ├── auth.js             # Login/Register API
│   ├── users.js            # Contacts/Search API
│   └── messages.js         # Message history API
└── index.js                # Main server + Socket.io

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/gouravojha121/Chat-App.git
cd Chat-App
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm start
```

### 4. Open in browser

http://localhost:3000
---

## 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) 
---

---

## 👨‍💻 Author

**Gourav Ojha**  
- GitHub: [@gouravojha121](https://github.com/gouravojha121)  
- Live App: [chat-app-wine-rho.vercel.app](https://chat-app-wine-rho.vercel.app)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

>  Agar project pasand aaya toh GitHub pe gouravojha121 ko follow zaroor karo!
