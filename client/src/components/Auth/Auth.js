import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__bg">
        <div className="auth__orb" />
      </div>

      <div className="auth__card">
        <button className="auth__back" onClick={() => navigate('/')}>
          ← Back
        </button>

        <div className="auth__logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M4 8C4 5.79 5.79 4 8 4h16c2.21 0 4 1.79 4 4v12c0 2.21-1.79 4-4 4H18l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="url(#g2)"/>
            <defs>
              <linearGradient id="g2" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c6af7"/><stop offset="1" stopColor="#f7916a"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Nexus</span>
        </div>

        <h2 className="auth__title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p className="auth__sub">{mode === 'login' ? 'Sign in to your account' : 'Join Nexus today'}</p>

        <div className="auth__tabs">
          <button className={`auth__tab ${mode === 'login' ? 'auth__tab--active' : ''}`} onClick={() => setMode('login')}>Login</button>
          <button className={`auth__tab ${mode === 'register' ? 'auth__tab--active' : ''}`} onClick={() => setMode('register')}>Register</button>
        </div>

        <form className="auth__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth__field">
              <label>Username</label>
              <input className="input" name="username" placeholder="cooluser123" value={form.username} onChange={handleChange} required />
            </div>
          )}
          <div className="auth__field">
            <label>Email</label>
            <input className="input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="auth__field">
            <label>Password</label>
            <input className="input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>

          {error && <div className="auth__error">{error}</div>}

          <button className="btn btn-primary auth__submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth__switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
