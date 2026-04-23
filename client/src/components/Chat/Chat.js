import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../hooks/useSocket';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socket = getSocket();

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    socket.emit('user:online', { token });
    socket.on('message:receive', (msg) => {
      setMessages(prev => {
        if (activeContact && (msg.sender._id === activeContact._id || msg.sender === activeContact._id)) {
          return [...prev, msg];
        }
        return prev;
      });
      setContacts(prev => prev.map(c =>
        c._id === (msg.sender._id || msg.sender) ? { ...c, lastMsg: msg.content } : c
      ));
    });
    socket.on('message:sent', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('user:status', ({ userId, isOnline }) => {
      setContacts(prev => prev.map(c => c._id === userId ? { ...c, isOnline } : c));
    });
    socket.on('typing:start', ({ senderId }) => {
      if (activeContact?._id === senderId) setIsTyping(true);
    });
    socket.on('typing:stop', ({ senderId }) => {
      if (activeContact?._id === senderId) setIsTyping(false);
    });
    return () => {
      socket.off('message:receive');
      socket.off('message:sent');
      socket.off('user:status');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [activeContact]);

  useEffect(() => {
    axios.get('/api/users/contacts').then(({ data }) => setContacts(data));
  }, []);

  useEffect(() => {
    if (!activeContact) return;
    axios.get(`/api/messages/${activeContact._id}`).then(({ data }) => setMessages(data));
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      axios.get(`/api/users/search?q=${searchQuery}`).then(({ data }) => setSearchResults(data));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const addContact = async (contactUser) => {
    try {
      await axios.post(`/api/users/contacts/${contactUser._id}`);
      setContacts(prev => [...prev, contactUser]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding contact');
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeContact) return;
    socket.emit('message:send', { token, receiverId: activeContact._id, content: input.trim() });
    socket.emit('typing:stop', { receiverId: activeContact._id });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('typing:start', { receiverId: activeContact?._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => {
      socket.emit('typing:stop', { receiverId: activeContact?._id });
    }, 1500));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const getAvatar = (name) => name?.charAt(0).toUpperCase();

  return (
    <div className="chat">
      <div className={`chat__sidebar ${sidebarOpen ? 'chat__sidebar--open' : ''}`}>
        <div className="chat__sidebar-header">
          <div className="chat__user-info">
            <div className="chat__avatar chat__avatar--me">{getAvatar(user?.username)}</div>
            <div>
              <div className="chat__username">{user?.username}</div>
              <div className="chat__status chat__status--online">● Online</div>
            </div>
          </div>
          <button className="chat__icon-btn" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>

        <div className="chat__search-wrap">
          <div className="chat__search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="chat__search-input"
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="chat__search-results">
              {searchResults.map(u => (
                <div key={u._id} className="chat__search-item" onClick={() => addContact(u)}>
                  <div className="chat__avatar">{getAvatar(u.username)}</div>
                  <div>
                    <div className="chat__search-name">{u.username}</div>
                    <div className="chat__search-email">{u.email}</div>
                  </div>
                  <span className="chat__add-btn">+ Add</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat__contacts-label">Messages</div>
        <div className="chat__contacts">
          {contacts.length === 0 && (
            <div className="chat__empty-contacts">
              <p>No contacts yet</p>
              <span>Search for users above to start chatting</span>
            </div>
          )}
          {contacts.map(contact => (
            <div
              key={contact._id}
              className={`chat__contact ${activeContact?._id === contact._id ? 'chat__contact--active' : ''}`}
              onClick={() => { setActiveContact(contact); setSidebarOpen(false); }}
            >
              <div className="chat__avatar-wrap">
                <div className="chat__avatar">{getAvatar(contact.username)}</div>
                {contact.isOnline && <div className="chat__online-dot" />}
              </div>
              <div className="chat__contact-info">
                <div className="chat__contact-name">{contact.username}</div>
                <div className="chat__contact-preview">{contact.lastMsg || 'Start a conversation'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat__main">
        {!activeContact ? (
          <div className="chat__welcome">
            <div className="chat__welcome-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a contact from the sidebar or search for someone new</p>
            <button className="btn btn-ghost" onClick={() => setSidebarOpen(true)}>Open Contacts</button>
          </div>
        ) : (
          <>
            <div className="chat__header">
              <button className="chat__icon-btn chat__back-btn" onClick={() => setSidebarOpen(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div className="chat__avatar-wrap">
                <div className="chat__avatar">{getAvatar(activeContact.username)}</div>
                {activeContact.isOnline && <div className="chat__online-dot" />}
              </div>
              <div>
                <div className="chat__header-name">{activeContact.username}</div>
                <div className={`chat__status ${activeContact.isOnline ? 'chat__status--online' : ''}`}>
                  {isTyping ? '✏️ typing...' : activeContact.isOnline ? '● Online' : '○ Offline'}
                </div>
              </div>
            </div>

            <div className="chat__messages">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="chat__date-divider"><span>{date}</span></div>
                  {msgs.map((msg, i) => {
                    const isMe = (msg.sender?._id || msg.sender) === user._id;
                    return (
                      <div key={msg._id || i} className={`chat__msg-wrap ${isMe ? 'chat__msg-wrap--me' : ''}`}>
                        {!isMe && <div className="chat__avatar chat__avatar--sm">{getAvatar(activeContact.username)}</div>}
                        <div className={`chat__bubble ${isMe ? 'chat__bubble--me' : 'chat__bubble--them'}`}>
                          <div className="chat__bubble-text">{msg.content}</div>
                          <div className="chat__bubble-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {isTyping && (
                <div className="chat__msg-wrap">
                  <div className="chat__avatar chat__avatar--sm">{getAvatar(activeContact.username)}</div>
                  <div className="chat__bubble chat__bubble--them chat__typing-bubble">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat__input-area">
              <textarea
                className="chat__input"
                placeholder={`Message ${activeContact.username}...`}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className="chat__send-btn" onClick={sendMessage} disabled={!input.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
