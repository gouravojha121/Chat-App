import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__bg">
        <div className="home__orb home__orb--1" />
        <div className="home__orb home__orb--2" />
        <div className="home__grid" />
      </div>

      <div className="home__content">
        <div className="home__logo">
          <div className="home__logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 8C4 5.79 5.79 4 8 4h16c2.21 0 4 1.79 4 4v12c0 2.21-1.79 4-4 4H18l-6 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="url(#g1)"/>
              <defs>
                <linearGradient id="g1" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c6af7"/>
                  <stop offset="1" stopColor="#f7916a"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="home__logo-text">Nexus</span>
        </div>

        <div className="home__hero">
          <h1 className="home__title">
            Connect.<br />
            <span className="home__title--gradient">Chat.</span><br />
            Anytime.
          </h1>
          <p className="home__subtitle">
            One app, two ways to connect. Secure accounts with full history, or jump in anonymously — your call.
          </p>
        </div>

        <div className="home__cards">
          <button className="home__card home__card--auth" onClick={() => navigate('/auth')}>
            <div className="home__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="home__card-text">
              <h3>Login with Email</h3>
              <p>Full account with chat history, contacts & more</p>
            </div>
            <div className="home__card-badge home__card-badge--purple">Persistent</div>
            <div className="home__card-arrow">→</div>
          </button>

          <button className="home__card home__card--anon" onClick={() => navigate('/anonymous')}>
            <div className="home__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div className="home__card-text">
              <h3>Go Anonymous</h3>
              <p>Pick a username, create or join a room instantly</p>
            </div>
            <div className="home__card-badge home__card-badge--orange">No Signup</div>
            <div className="home__card-arrow">→</div>
          </button>
        </div>

        <p className="home__footer">No data collected in anonymous mode · Open source · Free forever</p>
      </div>
    </div>
  );
};

export default Home;
