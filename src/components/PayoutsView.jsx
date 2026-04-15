import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/PayoutsView.css";

const PayoutsView = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingWallet, setViewingWallet] = useState(null); // null, "USD", "EUR", "GBP"
  const [activeTab, setActiveTab] = useState("Wallet history");

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
      const mockProfit = localOrders.filter(o => o.status === "PAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const mockPending = localOrders.filter(o => o.status === "UNPAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Generate mock transactions from local orders
      const mockTransactions = localOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        type: "Order",
        amount: order.totalAmount,
        isPaid: order.status === "PAID"
      }));

      setWallet({
        balance: (res.data?.balance || 0) + mockProfit,
        pending: (res.data?.pending || 0) + mockPending,
        transactions: [...mockTransactions, ...(res.data?.transactions || [])]
      });
    } catch (err) {
      console.error("Error fetching wallet:", err);
      const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
      const mockProfit = localOrders.filter(o => o.status === "PAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const mockPending = localOrders.filter(o => o.status === "UNPAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const mockTransactions = localOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        type: "Order",
        amount: order.totalAmount,
        isPaid: order.status === "PAID"
      }));

      setWallet({ balance: mockProfit, pending: mockPending, transactions: mockTransactions });
    } finally {
      setLoading(false);
    }
  };

  const wallets = [
    { currency: "USD", symbol: "$", balance: wallet?.balance || 0 },
  ];

  const handleBackToWallets = (e) => {
    e.preventDefault();
    setViewingWallet(null);
  };

  if (viewingWallet) {
    const symbol = wallets.find(w => w.currency === viewingWallet)?.symbol || "$";
    
    return (
      <div className="payouts-container animate-fade-in font-body">
        {/* Refined Detailed Breadcrumbs */}
        <nav className="payouts-breadcrumb">
          <Link to="#">Dashboard</Link>
          <span className="separator">/</span>
          <Link to="#" onClick={handleBackToWallets}>Wallets</Link>
          <span className="separator">/</span>
          <span>{viewingWallet}</span>
        </nav>

        {/* Refined Detailed Header */}
        <header className="payouts-header">
          <div className="payout-header-row">
            <button className="btn-back-square" onClick={handleBackToWallets}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1>{viewingWallet} wallet</h1>
          </div>
          <div className="timezone-link-v2">
            <span>(GMT+07:00) ICT / Bangkok</span>
            <Link to="#">Change timezone <i className="fa-solid fa-arrow-up-right-from-square text-[1.1rem]"></i></Link>
          </div>
        </header>

        {/* Horizontal Scorecards */}
        <div className="scorecards-container">
          <div className="scorecard-row">
            <span className="scorecard-label">Pending</span>
            <span className="scorecard-value">{symbol}{wallet?.pending?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="scorecard-row">
            <span className="scorecard-label">Paid</span>
            <span className="scorecard-value">{symbol}0.00</span>
          </div>
          <div className="scorecard-row">
            <span className="scorecard-label">Balance</span>
            <div className="scorecard-content">
              <span className="scorecard-value">{symbol}{wallet?.balance?.toFixed(2) || "0.00"}</span>
              <button className="btn-add-method">Add payout method</button>
            </div>
          </div>
        </div>

        {/* Tabs V3 */}
        <div className="payout-tabs-container-v3">
          {["Wallet history", "Payout history"].map((tab) => (
            <button
              key={tab}
              className={`payout-tab-v3 ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* History Table V3 */}
        <div className="payout-table-area-v3">
          <table className="payout-table-v3">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TYPE</th>
                <th>ID</th>
                <th>ENTRY</th>
                <th>PENDING</th>
                <th>BALANCE</th>
                <th>PAID</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === "Wallet history" && wallet?.transactions?.length > 0 ? (
                wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="animate-fade-in">
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>{tx.type}</td>
                    <td>{tx.id.substring(0, 8)}...</td>
                    <td>
                      <div className="entry-badge">
                        <i className={`fa-solid ${tx.amount >= 0 ? "fa-circle-check" : "fa-circle-minus"}`}></i>
                        <span>{tx.amount >= 0 ? "Credit" : "Debit"}</span>
                      </div>
                    </td>
                    <td style={{ color: tx.isPaid ? "#94a3b8" : "#1e293b" }}>{!tx.isPaid ? `${symbol}${tx.amount.toFixed(2)}` : ""}</td>
                    <td style={{ color: tx.isPaid ? "#1e293b" : "#94a3b8" }}>{tx.isPaid ? `${symbol}${tx.amount.toFixed(2)}` : ""}</td>
                    <td></td>
                  </tr>
                ))
              ) : activeTab === "Wallet history" && (
                <tr>
                   <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>No transactions found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
          {activeTab === "Payout history" && (
            <div className="payout-empty-v2 py-20 text-center">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>No payout history found</span>
            </div>
          )}
          
          {/* Pagination Footer */}
          {/* ... */}
        </div>
      </div>
    );
  }

  return (
    <div className="payouts-container animate-fade-in font-body">
      {/* List Breadcrumbs */}
      <nav className="payouts-breadcrumb">
        <Link to="#">Dashboard</Link>
        <span className="separator">/</span>
        <span>Wallets</span>
      </nav>

      {/* List Header */}
      <header className="payouts-header">
        <h1>Wallets</h1>
        <p className="description" style={{ fontSize: '1.55rem', color: '#64748b', lineHeight: '1.6', maxWidth: '110rem', marginTop: '1rem' }}>
          Choose your payout currency.
        </p>
      </header>

      {/* Wallets List */}
      <div className="wallets-list">
        {loading ? (
          <div className="animate-pulse">Loading wallet information...</div>
        ) : (
          wallets.map((walletItem) => (
            <div key={walletItem.currency} className="wallet-card-item">
              <div className="wallet-info">
                {walletItem.currency} / {walletItem.symbol} <span className="balance">{walletItem.balance.toFixed(2)}</span>
              </div>
              <button 
                className="btn-view-wallet"
                onClick={() => setViewingWallet(walletItem.currency)}
              >
                View wallet
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PayoutsView;
