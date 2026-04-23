import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../hooks/useSocket';
import './Anonymous.css';

const ADJECTIVES = ['Shadow','Ghost','Neon','Phantom','Cosmic','Stealth','Cipher','Rogue','Echo','Vortex'];
const NOUNS = ['Fox','Panda','Wolf','Hawk','Tiger','Raven','Lynx','Cobra','Eagle','Shark'];
const randomName = () => ADJECTIVES[Math.floor(Math.random()*ADJECTIVES.length)] + NOUNS[Math.floor(Math.random()*NOUNS.length)] + Math.floor(Math.random()*99);
const randomRoomId = () => Math.random().toString(36).substring(2,8).toUpperCase();

const Anonymous = () => {
  const navigate = useNavigate();
  const socket = getSocket();
  const [stage, setStage] = useState('setup');
  const [username, setUsername] = useState(randomName());
  const [roomId, setRoomId] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [joinMode, setJoinMode] = useState('create');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('anon:message:receive', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('anon:room:members', (m) => setMembers(m));
    socket.on('anon:user:joined', ({ username: u, members: m }) => {
      setMembers(m);
      setMessages(prev => [...prev, { id: Date.now(), system: true, content: `${u} joined the room` }]);
    });
    socket.on('anon:user:left', ({ username: u, members: m }) => {
      setMembers(m);
      setMessages(prev => [...prev, { id: Date.now(), system: true, content: `${u} left the room` }]);
    });
    socket.on('anon:typing:start', ({ username: u }) => setTypingUsers(prev => [...new Set([...prev, u])]));
    socket.on('anon:typing:stop', ({ username: u }) => setTypingUsers(prev => prev.filter(x => x !== u)));
    return () => {
      socket.off('anon:message:receive'); socket.off('anon:room:members');
      socket.off('anon:user:joined'); socket.off('anon:user:left');
      socket.off('anon:typing:start'); socket.off('anon:typing:stop');
    };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const enterRoom = () => {
    const finalRoomId = joinMode === 'create' ? randomRoomId() : roomInput.trim().toUpperCase();
    if (!finalRoomId) return alert('Enter a Room ID');
    setRoomId(finalRoomId);
    socket.emit('anon:join', { roomId: finalRoomId, username });
    setStage('room');
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('anon:message', { roomId, username, content: input.trim() });
    socket.emit('anon:typing:stop', { roomId, username });
    setInput('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('anon:typing:start', { roomId, username });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => socket.emit('anon:typing:stop', { roomId, username }), 1500));
  };

  const leaveRoom = () => {
    socket.emit('anon:leave', { roomId, username });
    setMessages([]); setMembers([]); setStage('setup'); setRoomId('');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const getColor = (name) => {
    const colors = ['#7c6af7','#f7916a','#4ade80','#60a5fa','#f472b6','#facc15','#34d399'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (stage === 'setup') return (
    <div className="anon">
      <div className="anon__bg">
        <div className="anon__orb anon__orb--1" />
        <div className="anon__orb anon__orb--2" />
      </div>
      <div className="anon__setup-card">
        <button className="anon__back" onClick={() => navigate('/')}>← Back</button>
        <div className="anon__setup-header">
          <div className="anon__mask-icon">👻</div>
          <h2>Anonymous Mode</h2>
          <p>No account needed. No history saved. Just chat.</p>
        </div>
        <div className="anon__field">
          <label>Your Username</label>
          <div className="anon__username-row">
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username..." maxLength={20} />
            <button className="btn btn-ghost anon__shuffle" onClick={() => setUsername(randomName())} title="Random name">🔀</button>
          </div>
        </div>
        <div className="anon__tabs">
          <button className={`anon__tab ${joinMode==='create'?'anon__tab--active':''}`} onClick={() => setJoinMode('create')}>Create Room</button>
          <button className={`anon__tab ${joinMode==='join'?'anon__tab--active':''}`} onClick={() => setJoinMode('join')}>Join Room</button>
        </div>
        {joinMode === 'create' ? (
          <div className="anon__info-box">ℹ️ A random Room ID will be generated. Share it with friends to invite them.</div>
        ) : (
          <div className="anon__field">
            <label>Room ID</label>
            <input className="input" value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase())} placeholder="e.g. AB12CD" maxLength={8} />
          </div>
        )}
        <button className="btn btn-primary anon__enter-btn" onClick={enterRoom}>
          {joinMode === 'create' ? '🚀 Create & Enter Room' : '🔗 Join Room'}
        </button>
        <div className="anon__privacy-note">🔒 Messages exist only in memory · Cleared when you leave</div>
      </div>
    </div>
  );

  return (
    <div className="anon-room">
      <div className="anon-room__header">
        <div className="anon-room__header-left">
          <button className="chat__icon-btn" onClick={leaveRoom}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
          <div>
            <div className="anon-room__title">
              <span className="anon-room__badge">ANON</span> Room #{roomId}
            </div>
            <div className="anon-room__subtitle">{members.length} member{members.length !== 1 ? 's' : ''} online</div>
          </div>
        </div>
        <div className="anon-room__header-right">
          <button className="btn btn-ghost anon-room__copy-btn" onClick={copyRoomId}>
            {copied ? '✅ Copied!' : '📋 Copy ID'}
          </button>
          <button className="chat__icon-btn" onClick={() => setShowMembers(!showMembers)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="anon-room__body">
        <div className="anon-room__messages">
          <div className="anon-room__welcome-msg">
            <span>🎉 You joined as <strong>{username}</strong> in room <strong>#{roomId}</strong></span>
            <span className="anon-room__share-hint">Share Room ID <strong>{roomId}</strong> with others!</span>
          </div>
          {messages.map((msg) => {
            if (msg.system) return <div key={msg.id} className="anon-room__system-msg">{msg.content}</div>;
            const isMe = msg.username === username;
            return (
              <div key={msg.id} className={`anon-room__msg-wrap ${isMe ? 'anon-room__msg-wrap--me' : ''}`}>
                {!isMe && <div className="anon-room__avatar" style={{ background: getColor(msg.username) }}>{msg.username.charAt(0)}</div>}
                <div className={`anon-room__bubble ${isMe ? 'anon-room__bubble--me' : ''}`}>
                  {!isMe && <div className="anon-room__sender" style={{ color: getColor(msg.username) }}>{msg.username}</div>}
                  <div className="anon-room__bubble-text">{msg.content}</div>
                  <div className="anon-room__bubble-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            );
          })}
          {typingUsers.length > 0 && (
            <div className="anon-room__typing">✏️ {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showMembers && (
          <div className="anon-room__members">
            <div className="anon-room__members-title">Members ({members.length})</div>
            {members.map((m, i) => (
              <div key={i} className="anon-room__member">
                <div className="anon-room__avatar anon-room__avatar--sm" style={{ background: getColor(m) }}>{m.charAt(0)}</div>
                <span>{m} {m === username && <em style={{color:'var(--text-muted)'}}>(you)</em>}</span>
                <div className="anon-room__member-dot" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="anon-room__input-area">
        <textarea className="chat__input" placeholder="Type a message..." value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} rows={1} />
        <button className="chat__send-btn" onClick={sendMessage} disabled={!input.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Anonymous;
