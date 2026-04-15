import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      
      // Save profile for frontend RBAC
      const u = res.data.user;
      const nameParts = (u?.name || 'User').split(' ');
      
      // Backend returns "USER" or "ADMIN". We map "USER" -> "customer" for frontend logic.
      let mappedRole = (u?.role || 'USER').toLowerCase();
      if (mappedRole === 'user') mappedRole = 'customer';

      const userProfile = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: u?.email || email,
        role: mappedRole
      };
      localStorage.setItem('user_profile', JSON.stringify(userProfile));

      // Redirect based on role
      if (userProfile.role === 'admin') {
        navigate('/addpage');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
  
        <div className="login-left">
          <h1>POD Master</h1>
          <p>Design your own style, we print it for you.</p>
          <button className="btn-read-more">Read More</button>
        </div>

        <div className="login-right">
          <form className="login-form-wrapper" onSubmit={handleLogin}>
            <h2>Hello Again!</h2>
            <p className="welcome-back">Welcome Back</p>

            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

            <div className="input-box">
              <span><i className="fa-regular fa-envelope"></i></span>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <span><i className="fa-solid fa-lock"></i></span>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-login-main">Login</button>
            <a href="/signup" className="forgot-pass" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Sign Up</a>

            <div className="social-login-section">
              <p>OR Continue with</p>
              <div className="social-btns">
                <button type="button" className="social-btn">
                  <span className="icon-fb"><i className="fa-brands fa-facebook"></i></span>
                   Facebook
                  </button>
                <button type="button" className="social-btn">
                <span className="icon-gl"><i className="fa-brands fa-google"></i></span>
                   Facebook
                  </button>
                <button type="button" className="social-btn">
                  <span className="icon-app"><i className="fa-brands fa-apple"></i></span>
                  Apple
                  </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;