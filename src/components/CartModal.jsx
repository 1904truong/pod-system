import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CartModal.css";
import visa from "../assets/pay/visa.png";
import mc from "../assets/pay/mc.png";
import am from "../assets/pay/am.png";
import paypal from "../assets/pay/paypal.png";
import kla from "../assets/pay/kla.png";

// Real product images from Home page
import na1 from "../assets/newarrive/1.webp";
import na2 from "../assets/newarrive/2.webp";
import na3 from "../assets/newarrive/3.webp";
import na4 from "../assets/newarrive/4.webp";
import na5 from "../assets/newarrive/5.webp";
import na6 from "../assets/newarrive/6.webp";

const CartModal = ({ isOpen, onClose, product, selectedSize, selectedColor, quantity, selectedType }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  // Price calculations
  const unitPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));
  const originalTotal = (unitPrice * quantity).toFixed(2);
  const discountedTotal = (unitPrice * quantity * 0.9).toFixed(2);
  const discountAmount = (unitPrice * quantity * 0.1).toFixed(2);

  // Real data using the Home page assets
  const frequentlyBought = [
    {
      id: 1,
      name: "Dricka Whisky Grilla Och Ta Tupplurar",
      price: "€21.99",
      image: na1,
    },
    {
      id: 2,
      name: "Jag Vill Bara Dricka Whisky",
      price: "€21.99",
      image: na2,
    },
    {
      id: 3,
      name: "Jag Vill Bara Dricka Öl",
      price: "€21.99",
      image: na3,
    },
    {
      id: 4,
      name: "Dricka Öl, Åka Till Stugan Och Ta Tupplur",
      price: "€21.99",
      image: na4,
    },
  ];

  const handleAddToOrder = () => {
    onClose();
    navigate("/category");
    window.scrollTo(0, 0);
  };

  const handleContinueShopping = () => {
    onClose();
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="cart-body">
          {/* Main Item */}
          <div className="cart-item-card">
            <div className="cart-item-main">
              <div className="cart-item-img-side">
                <img src={product?.image || "https://picsum.photos/200/200?random=10"} alt={product?.name} />
                <button className="btn-remove">REMOVE</button>
              </div>
              <div className="cart-item-details">
                <div className="item-title-row">
                  <h3>{product?.name || "Dricka Öl Grilla Och Ta Tupplurar"}</h3>
                  <div className="item-price">
                    <span className="price-old">€{originalTotal}</span>
                    <span className="price-new">€{discountedTotal}</span>
                  </div>
                </div>

                <div className="selectors-row">
                  <div className="selector-group">
                    <label>Product</label>
                    <div className="custom-select">
                      <select defaultValue={selectedType}>
                        <option value={selectedType}>{selectedType}</option>
                      </select>
                      <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                    </div>
                  </div>
                  <div className="selector-group">
                    <label>Color</label>
                    <div className="custom-select">
                      <select defaultValue={selectedColor?.name}>
                        <option value={selectedColor?.name}>{selectedColor?.name}</option>
                      </select>
                      <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                    </div>
                  </div>
                  <div className="selector-group">
                    <label>Size</label>
                    <div className="custom-select">
                      <select defaultValue={selectedSize}>
                        <option value={selectedSize}>{selectedSize}</option>
                      </select>
                      <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                    </div>
                  </div>
                  <div className="selector-group qty-group">
                    <label>Qty</label>
                    <div className="custom-select">
                      <select defaultValue={quantity}>
                        <option value={quantity}>{quantity}</option>
                      </select>
                      <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-add-style">+ Another style or color</button>

            {/* Upsell Item */}
            <div className="upsell-item">
              <div className="upsell-img">
                <img src={na5} alt="Hoodie" />
              </div>
              <div className="upsell-text">
                <strong>Dricka Öl Grilla Och Ta Tupplurar</strong>
                <span>€34.99</span>
              </div>
              <button className="btn-add-order" onClick={handleAddToOrder}>Add to order</button>
            </div>
          </div>

          <div className="frequently-bought-section">
            <h4>Frequently bought together</h4>
            <div className="fb-grid">
              {frequentlyBought.map((item) => (
                <div key={item.id} className="fb-card">
                  <div className="fb-img-wrap">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="fb-info">
                    <span className="fb-name">{item.name}</span>
                    <span className="fb-price">{item.price}</span>
                  </div>
                  <button className="btn-fb-add" onClick={handleAddToOrder}>Add to order</button>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary-section">
            <h4>Order Summary</h4>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row">
              <span>Discount (10% OFF)</span>
              <span className="discount-val">-€{discountAmount}</span>
            </div>
            <div className="summary-row subtotal">
              <span>Subtotal ({quantity} items)</span>
              <span>€{discountedTotal}</span>
            </div>
          </div>

          <button className="btn-continue" onClick={handleContinueShopping}>Continue shopping</button>

          <div className="checkout-sticky">
            <button 
              className="btn-proceed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                navigate("/checkout", { 
                  state: { 
                    product, 
                    selectedSize, 
                    selectedColor, 
                    quantity, 
                    selectedType,
                    discountedTotal 
                  } 
                });
                
                // Also close the modal strictly using state
                setTimeout(() => {
                    onClose();
                }, 100);
              }}
            >
              Proceed to Secure Checkout
            </button>
            <div className="payment-logos">
              <img src={visa} alt="Visa" />
              <img src={mc} alt="Mastercard" />
              <img src={am} alt="Amex" />
              <img src={paypal} alt="Paypal" />
              <img src={kla} alt="Klarna" />
              <div className="brand-logos">
                <span className="stripe-text">stripe</span>
                <div className="secure-badge">
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Secure <b>SSL ENCRYPTION</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
