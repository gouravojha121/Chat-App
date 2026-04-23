const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => res.send('ChatApp Server Running ✅'));

// ─────────────────────────────────────────────
//  SOCKET.IO LOGIC
// ─────────────────────────────────────────────

// Track online users: userId → socketId
const onlineUsers = new Map();
// Anonymous rooms: roomId → Set of { socketId, username }
const anonymousRooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── AUTHENTICATED MODE ──────────────────────
  socket.on('user:online', async ({ token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return;

      socket.userId = user._id.toString();
      onlineUsers.set(socket.userId, socket.id);
      await User.findByIdAndUpdate(socket.userId, { isOnline: true });

      // Notify user's contacts that they came online
      const fullUser = await User.findById(socket.userId).populate('contacts', '_id');
      fullUser.contacts.forEach(contact => {
        const contactSocketId = onlineUsers.get(contact._id.toString());
        if (contactSocketId) {
          io.to(contactSocketId).emit('user:status', { userId: socket.userId, isOnline: true });
        }
      });

      socket.emit('user:online:ack', { userId: socket.userId });
    } catch (err) {
      console.error('user:online error', err.message);
    }
  });

  socket.on('message:send', async ({ token, receiverId, content }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const senderId = decoded.id;

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content
      });

      const populated = await message.populate('sender', 'username');

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:receive', populated);
      }

      // Send back to sender
      socket.emit('message:sent', populated);
    } catch (err) {
      console.error('message:send error', err.message);
    }
  });

  // ── ANONYMOUS MODE ──────────────────────────
  socket.on('anon:join', ({ roomId, username }) => {
    socket.anonUsername = username;
    socket.anonRoom = roomId;
    socket.join(roomId);

    if (!anonymousRooms.has(roomId)) anonymousRooms.set(roomId, new Map());
    anonymousRooms.get(roomId).set(socket.id, username);

    const members = Array.from(anonymousRooms.get(roomId).values());
    io.to(roomId).emit('anon:room:members', members);
    io.to(roomId).emit('anon:user:joined', { username, members });

    console.log(`👤 ${username} joined room: ${roomId}`);
  });

  socket.on('anon:message', ({ roomId, username, content }) => {
    const message = {
      id: Date.now().toString(),
      username,
      content,
      timestamp: new Date().toISOString()
    };
    // Send to everyone in room including sender
    io.to(roomId).emit('anon:message:receive', message);
  });

  socket.on('anon:leave', ({ roomId, username }) => {
    socket.leave(roomId);
    if (anonymousRooms.has(roomId)) {
      anonymousRooms.get(roomId).delete(socket.id);
      if (anonymousRooms.get(roomId).size === 0) {
        anonymousRooms.delete(roomId);
      } else {
        const members = Array.from(anonymousRooms.get(roomId).values());
        io.to(roomId).emit('anon:user:left', { username, members });
      }
    }
  });

  socket.on('typing:start', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:start', { senderId: socket.userId });
    }
  });

  socket.on('typing:stop', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:stop', { senderId: socket.userId });
    }
  });

  socket.on('anon:typing:start', ({ roomId, username }) => {
    socket.to(roomId).emit('anon:typing:start', { username });
  });

  socket.on('anon:typing:stop', ({ roomId, username }) => {
    socket.to(roomId).emit('anon:typing:stop', { username });
  });

  // ── DISCONNECT ──────────────────────────────
  socket.on('disconnect', async () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);

    // Handle authenticated user going offline
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { isOnline: false });

      const fullUser = await User.findById(socket.userId).populate('contacts', '_id');
      if (fullUser) {
        fullUser.contacts.forEach(contact => {
          const contactSocketId = onlineUsers.get(contact._id.toString());
          if (contactSocketId) {
            io.to(contactSocketId).emit('user:status', { userId: socket.userId, isOnline: false });
          }
        });
      }
    }

    // Handle anonymous user leaving room
    if (socket.anonRoom && socket.anonUsername) {
      const roomId = socket.anonRoom;
      if (anonymousRooms.has(roomId)) {
        anonymousRooms.get(roomId).delete(socket.id);
        if (anonymousRooms.get(roomId).size === 0) {
          anonymousRooms.delete(roomId);
        } else {
          const members = Array.from(anonymousRooms.get(roomId).values());
          io.to(roomId).emit('anon:user:left', { username: socket.anonUsername, members });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
