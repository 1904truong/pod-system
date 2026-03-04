// src/pages/Login.jsx
import React from "react";
import "../styles/signup.css";

const Login = () => {
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Create an account</h2>
        <p>
          Already have an account? <strong>Log in</strong>
        </p>

        <div className="input-group">
          <label>What should we call you?</label>
          <input type="text" placeholder="Enter your profile name" />
        </div>

        <div className="input-group">
          <label>What's your email?</label>
          <input type="email" placeholder="Enter your email address" />
        </div>

        <div className="input-group">
          <label>Create a password</label>
          <input type="password" placeholder="Enter your password" />
        </div>

        <button className="btn-submit">Create an account</button>

        <div className="divider">OR Continue with</div>

        <div className="social-group">
          <button className="social-btn">
            <span className="icon-fb">
              <i class="fa-brands fa-facebook"></i>
            </span>
            Facebook
          </button>
          <button className="social-btn">
            <span className="icon-gl">
              <i class="fa-brands fa-google"></i>
            </span>
            Facebook
          </button>
          <button className="social-btn">
            <span className="icon-app">
              <i class="fa-brands fa-apple"></i>
            </span>
            Apple
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
