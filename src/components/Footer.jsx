import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-cols">
          {/* Store Info */}
          <div className="footer-col">
            <h4>Store Info</h4>
            <ul>
              <li>About us</li>
              <li>Privacy Policy</li>
              <li>Terms &amp; conditions</li>
              <li>Copyright &amp; trademark policy</li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="footer-col">
            <h4>Help &amp; Support</h4>
            <ul>
              <li>Contact us</li>
              <li>FAQs</li>
            </ul>
          </div>

          {/* Store Settings */}
          <div className="footer-col">
            <h4>Store Settings</h4>
            <ul>
              <li>Location: United Kingdom</li>
              <li>Language: English (US)</li>
              <li>Currency: € EUR</li>
            </ul>
          </div>

          {/* Payment icons */}
          <div className="footer-col footer-payments">
            <div className="payment-icons">
              <span className="pay-badge">VISA</span>
              <span className="pay-badge mastercard">
                <span className="mc-left"></span>
                <span className="mc-right"></span>
              </span>
              <span className="pay-badge amex">AMEX</span>
              <span className="pay-badge paypal">PayPal</span>
              <span className="pay-badge klarna">Klarna.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
