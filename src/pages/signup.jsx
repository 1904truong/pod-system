import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../utils/api';
import "../styles/signup.css";

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Thêm state role, mặc định là customer
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Send the role along with other user data
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      
      // Cache basic profile for Settings page simulation
      const nameParts = name.trim().split(' ');
      const defaultProfile = {
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: email,
        phone: '+84 0353 748 091', // default template
        role: role
      };
      localStorage.setItem('user_profile', JSON.stringify(defaultProfile));
      
      // Điều hướng dựa trên role
      if (role === 'admin') {
        navigate('/addpage'); // Admin vào Dashboard
      } else {
        navigate('/'); // Khách hàng về Trang chủ
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed!');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSignup}>
        <h2>Create an account</h2>
        <p>
          Already have an account? <Link to="/login"><strong>Log in</strong></Link>
        </p>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}

        {/* Role Selector */}
        <div className="input-group" style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Sign up as:</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              type="button" 
              onClick={() => setRole('customer')}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: role === 'customer' ? "2px solid #000" : "1px solid #ddd",
                backgroundColor: role === 'customer' ? "#f9f9f9" : "#fff",
                fontWeight: role === 'customer' ? "bold" : "normal",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <i className="fa-regular fa-user" style={{ marginRight: "8px" }}></i>
              Khách hàng
            </button>
            <button 
              type="button" 
              onClick={() => setRole('admin')}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: role === 'admin' ? "2px solid #000" : "1px solid #ddd",
                backgroundColor: role === 'admin' ? "#f9f9f9" : "#fff",
                fontWeight: role === 'admin' ? "bold" : "normal",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <i className="fa-solid fa-shop" style={{ marginRight: "8px" }}></i>
              Admin
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>What should we call you?</label>
          <input 
            type="text" 
            placeholder="Enter your profile name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>What's your email?</label>
          <input 
            type="email" 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Create a password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="signup-btn-submit">Create an account</button>

        <div className="divider">OR Continue with</div>

        <div className="social-group">
          <button type="button" className="social-btn">
            <span className="icon-fb">
              <i className="fa-brands fa-facebook"></i>
            </span>
            Facebook
          </button>
          <button type="button" className="social-btn">
            <span className="icon-gl">
              <i className="fa-brands fa-google"></i>
            </span>
            Facebook
          </button>
          <button type="button" className="social-btn">
            <span className="icon-app">
              <i className="fa-brands fa-apple"></i>
            </span>
            Apple
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
