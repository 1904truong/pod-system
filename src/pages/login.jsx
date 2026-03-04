import React from 'react';
import '../styles/Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card-wrapper">
  
        <div className="login-left">
          <h1>POD Master</h1>
          <p>Design your own style, we print it for you.</p>
          <button className="btn-read-more">Read More</button>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <h2>Hello Again!</h2>
            <p className="welcome-back">Welcome Back</p>

            <div className="input-box">
              <span><i class="fa-regular fa-envelope"></i></span>
              <input type="email" placeholder="Email Address" />
            </div>

            <div className="input-box">
              <span><i class="fa-solid fa-lock"></i></span>
              <input type="password" placeholder="Password" />
            </div>

            <button className="btn-login-main">Login</button>
            <a href="#" className="forgot-pass">Forgot Password</a>

            <div className="social-login-section">
              <p>OR Continue with</p>
              <div className="social-btns">
                <button className="social-btn">
                  <span className="icon-fb"><i class="fa-brands fa-facebook"></i></span>
                   Facebook
                  </button>
                <button className="social-btn">
                <span className="icon-gl"><i class="fa-brands fa-google"></i></span>
                   Facebook
                  </button>
                <button className="social-btn">
                  <span className="icon-app"><i class="fa-brands fa-apple"></i></span>
                  Apple
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;