import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";
import stripeLogo from "../assets/pay/mc.png"; // Placeholder for stripe
import visa from "../assets/pay/visa.png";
import mc from "../assets/pay/mc.png";
import am from "../assets/pay/am.png";
import paypal from "../assets/pay/paypal.png";
import kla from "../assets/pay/kla.png";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || {};

  const { product, selectedSize, selectedColor, selectedType } = orderData;
  const [quantity, setQuantity] = useState(orderData.quantity || 1);
  const [shippingMethod, setShippingMethod] = useState("priority");

  const [email, setEmail] = useState("");

  // Prices
  const unitPrice = parseFloat(product?.price?.replace(/[^0-9.]/g, "") || "0");
  const productsTotal = (unitPrice * quantity).toFixed(2);
  const discountAmount = (unitPrice * quantity * 0.1).toFixed(2);
  
  const shippingCosts = {
    standard: 17.49,
    priority: 20.49,
    express: 30.49
  };

  const selectedShippingCost = shippingCosts[shippingMethod];
  const finalTotal = (parseFloat(productsTotal) - parseFloat(discountAmount) + selectedShippingCost).toFixed(2);

  const handleQtyChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleProcessPayment = () => {
    if (!email) {
      alert("Please enter your email address to proceed.");
      return;
    }

    // Create a mock order that matches the OrdersView schema expectation
    const mockOrder = {
      id: "mock_" + Date.now(),
      orderNumber: Math.floor(10000 + Math.random() * 90000).toString(), // Random 5-digit number
      createdAt: new Date().toISOString(),
      store: { name: "Breezy Sunz" }, // Simulated store name
      totalAmount: parseFloat(finalTotal),
      status: "UNPAID",
      customerName: email,
      fulfilment: "Not Started",
      delivery: "Not Started",
      placedAt: Date.now() // Timestamp to track the 20s delay
    };

    const existingOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
    localStorage.setItem("mock_orders", JSON.stringify([mockOrder, ...existingOrders]));

    // Create a mock task log entry
    const mockTask = {
      id: "mock_task_" + Date.now(),
      name: `New customer order ${mockOrder.orderNumber} - Breezy Sunz`,
      status: "Success",
      createdOn: new Date().toLocaleString(),
      startedOn: new Date().toLocaleString(),
      finishedOn: new Date().toLocaleString(),
      duration: "0s",
      createdBy: email
    };
    const existingTasks = JSON.parse(localStorage.getItem("mock_tasks") || "[]");
    localStorage.setItem("mock_tasks", JSON.stringify([mockTask, ...existingTasks]));

    alert("Simulated Payment Successful! Your order has been placed.");
    navigate("/addpage");
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left Side: Forms */}
        <div className="checkout-main">
          <header className="checkout-header">
            <span className="material-symbols-outlined lock-icon">lock</span>
            <h1>Secure checkout</h1>
          </header>

          <section className="checkout-section">
            <h2 className="section-title">1. Delivery Address</h2>
            <p className="section-subtitle">All fields marked with * are required</p>

            <form className="delivery-form">
              <div className="form-row full">
                <div className="input-group">
                  <label>Email address *</label>
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row split">
                <div className="input-group">
                  <label>First name *</label>
                  <input type="text" placeholder="Your first name" />
                </div>
                <div className="input-group">
                  <label>Last name *</label>
                  <input type="text" placeholder="Your last name" />
                </div>
              </div>

              <div className="form-row split-70-30">
                <div className="input-group">
                  <label>Address *</label>
                  <input type="text" placeholder="Your address" />
                </div>
                <div className="input-group">
                  <label>App, suite</label>
                  <input type="text" placeholder="App or suite" />
                </div>
              </div>

              <div className="form-row full">
                <div className="input-group">
                  <label>City *</label>
                  <input type="text" placeholder="Your city" />
                </div>
              </div>

              <div className="form-row split">
                <div className="input-group">
                  <label>Region</label>
                  <input type="text" placeholder="Your region" />
                </div>
                <div className="input-group">
                  <label>Post code *</label>
                  <input type="text" placeholder="Your post code" />
                </div>
              </div>

              <div className="form-row full">
                <div className="input-group">
                  <label>Country *</label>
                  <select defaultValue="United Kingdom">
                    <option>United Kingdom</option>
                    <option>Vietnam</option>
                    <option>USA</option>
                  </select>
                </div>
              </div>

              <div className="form-links">
                <a href="#billing">Use a different billing address</a>
              </div>

              <div className="form-checkbox">
                <input type="checkbox" id="notify" />
                <label htmlFor="notify">Notify me about new designs and promotions</label>
              </div>
            </form>

            <div className="trust-footer">
               <div className="secure-badge-checkout">
                  <span className="material-symbols-outlined">verified_user</span>
                  <div className="badge-text">
                    <strong>Secure</strong>
                    <span>SSL ENCRYPTION</span>
                  </div>
               </div>
               <div className="stripe-powered">
                  <span>Powered by</span>
                  <div className="stripe-brand">stripe</div>
               </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2 className="section-title">2. Delivery Options</h2>
            
            <div className="delivery-options-list">
              <label className={`delivery-option-card ${shippingMethod === 'standard' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'standard'} 
                  onChange={() => setShippingMethod('standard')} 
                />
                <div className="option-info">
                  <div className="option-top">
                    <strong>Standard</strong>
                    <span className="option-price">€17.49</span>
                  </div>
                  <p>Printed locally before Wednesday, Apr 15. Delivery 1 - 2 days.</p>
                </div>
              </label>

              <label className={`delivery-option-card ${shippingMethod === 'priority' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'priority'} 
                  onChange={() => setShippingMethod('priority')} 
                />
                <div className="option-info">
                  <div className="option-top">
                    <strong>Priority <span className="recommended-tag">Recommended</span></strong>
                    <span className="option-price">€20.49</span>
                  </div>
                  <p>Printed locally the next business day. Arrives up to 2 days sooner than Standard.</p>
                </div>
              </label>

              <label className={`delivery-option-card ${shippingMethod === 'express' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="shipping" 
                  checked={shippingMethod === 'express'} 
                  onChange={() => setShippingMethod('express')} 
                />
                <div className="option-info">
                  <div className="option-top">
                    <strong>Express</strong>
                    <span className="option-price">€30.49</span>
                  </div>
                  <p>Printed and shipped ASAP with full tracking.</p>
                </div>
              </label>
            </div>

            <button className="btn-final-payment" type="button" onClick={handleProcessPayment}>
              Proceed to payment
            </button>

            <div className="payment-logos-checkout">
              <img src={visa} alt="Visa" />
              <img src={mc} alt="Mastercard" />
              <img src={am} alt="Amex" />
              <img src={paypal} alt="Paypal" />
              <img src={kla} alt="Klarna" />
            </div>

            <p className="terms-text">
              By continuing, you agree to our <strong>Terms & conditions</strong>
            </p>

            <button className="btn-back-to-top" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              Back to top <i className="fa-solid fa-caret-up"></i>
            </button>
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <aside className="checkout-sidebar">
          <div className="sticky-summary">
            <h2 className="summary-title">Order summary</h2>
            
            <div className="checkout-item-card">
              <div className="item-img-box">
                <img src={product?.image} alt={product?.name} />
              </div>
              <div className="item-content">
                <div className="item-header-row">
                  <h3>{product?.name}</h3>
                  <button className="remove-link">REMOVE</button>
                </div>
                <p className="item-meta">{selectedType}</p>
                <p className="item-meta">Size: {selectedSize}</p>
                <p className="item-meta">Color: {selectedColor?.name}</p>
                
                <div className="item-footer-row">
                  <div className="qty-picker">
                    <button onClick={() => handleQtyChange(-1)}>—</button>
                    <span>{quantity}</span>
                    <button onClick={() => handleQtyChange(1)}>+</button>
                  </div>
                  <div className="price-stack">
                    <span className="price-old">€{productsTotal}</span>
                    <span className="price-new">€{(parseFloat(productsTotal) - parseFloat(discountAmount)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="checkout-totals">
              <div className="total-row">
                <span>Products</span>
                <span>€{productsTotal}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>€{selectedShippingCost.toFixed(2)}</span>
              </div>
              <div className="total-row discountLine">
                <span>Discount</span>
                <span>-€{discountAmount}</span>
              </div>
              <hr />
              <div className="total-row final-total">
                <strong>Total ({quantity} items)</strong>
                <strong>€{finalTotal}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
