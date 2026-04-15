import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/OrdersView.css";

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [balance, setBalance] = useState({ balance: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchWallet();

    // 20-second simulation: Periodically check and complete mock orders
    const interval = setInterval(() => {
      try {
        const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
        let changed = false;
        const now = Date.now();
        
        const updatedOrders = localOrders.map(order => {
          if (order.placedAt && (now - order.placedAt >= 20000) && order.status !== "PAID") {
            changed = true;
            return {
              ...order,
              status: "PAID",
              fulfilment: "Completed",
              delivery: "Delivered"
            };
          }
          return order;
        });

        if (changed) {
          localStorage.setItem("mock_orders", JSON.stringify(updatedOrders));
          
          // Re-fetch to update table rows and metrics gracefully
          fetchOrders(); 
          fetchWallet(); 
        }
      } catch (err) {
        console.error("Simulation error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
      setOrders([...localOrders, ...res.data]);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
      setOrders(localOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet/balance");
      const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
      
      const mockProfit = localOrders
         .filter(o => o.status === "PAID")
         .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const mockPending = localOrders
         .filter(o => o.status === "UNPAID")
         .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setBalance({
        balance: (res.data?.balance || 0) + mockProfit,
        pending: (res.data?.pending || 0) + mockPending
      });
    } catch (err) {
      console.error("Error fetching wallet:", err);
      const localOrders = JSON.parse(localStorage.getItem("mock_orders") || "[]");
      const mockProfit = localOrders.filter(o => o.status === "PAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const mockPending = localOrders.filter(o => o.status === "UNPAID").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      setBalance({ balance: mockProfit, pending: mockPending });
    }
  };

  const metrics = [
    { label: "ORDERS", value: orders.length.toString() },
    { label: "PROFIT", value: `€${balance.balance.toFixed(2)}` },
    { label: "PENDING", value: `€${balance.pending.toFixed(2)}` },
  ];

  const tableHeaders = [
    { label: "ORDER ID", sortable: false },
    { label: "STORE", sortable: false },
    { label: "CREATED", sortable: false },
    { label: "TOTAL COST", sortable: false },
    { label: "PAYMENT", sortable: false },
    { label: "FULFILMENT", sortable: false },
    { label: "DELIVERY", sortable: false },
    { label: "CUSTOMER CONTACT", sortable: false },
    { label: "", sortable: false },
  ];

  return (
    <div className="orders-view-container animate-fade-in font-body">
      {/* ... (Breadcrumbs & Header remains) ... */}

      {/* Summary Metrics Bar */}
      <div className="orders-summary-bar">
        <div className="filter-toggle">
          <i className="fa-solid fa-sliders"></i>
          <span>Filters</span>
        </div>
        
        <div className="summary-metrics-group">
          <div className="currency-selector">
            EUR <i className="fa-solid fa-caret-down"></i>
          </div>
          {metrics.map((m) => (
            <div key={m.label} className="metric-item">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              {tableHeaders.map((h, i) => (
                <th key={i}>
                  {h.label}
                  {h.sortable && <i className="fa-solid fa-arrow-down"></i>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '40px' }}>No orders found</td></tr>
            ) : (
              orders.map((order) => {
                const isMock = order.id?.startsWith("mock_");
                return (
                 <tr key={order.id}>
                   <td style={{ color: '#0066cc', cursor: 'pointer' }}>{order.orderNumber}</td>
                   <td style={{ color: '#0066cc', cursor: 'pointer' }}>{order.store?.name}</td>
                   <td style={{ color: '#666' }}>
                     {new Date(order.createdAt).toLocaleDateString('en-GB', {
                       day: '2-digit', month: 'short', year: 'numeric',
                       hour: '2-digit', minute: '2-digit'
                     })}
                   </td>
                   <td>€{order.totalAmount.toFixed(2)}</td>
                   <td>
                     <span className={`status-badge ${order.status === "PAID" ? "green-badge" : "gray-badge"}`}>
                       <span className="status-dot"></span> 
                       {order.status === "UNPAID" ? "Unpaid" : (order.status || "Unpaid")}
                     </span>
                   </td>
                   <td>
                     <span className={`status-badge ${order.fulfilment === "Completed" ? "green-badge" : "gray-badge"}`}>
                       <span className="status-dot"></span> 
                       {order.fulfilment || "Not Started"}
                     </span>
                   </td>
                   <td>
                     <span className={`status-badge ${order.delivery === "Delivered" ? "green-badge" : "gray-badge"}`}>
                        <span className="status-dot"></span> 
                        {order.delivery || "Not Started"}
                     </span>
                   </td>
                   <td style={{ color: '#666' }}>{order.customerName || "N/A"}</td>
                   <td style={{textAlign: "right", whiteSpace: "nowrap"}}>
                     <button style={{ color: '#0066cc', fontWeight: 'bold', border: 'none', background: 'none', marginRight: '15px', cursor: 'pointer' }}>Pay</button>
                     <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}>
                       <i className="fa-solid fa-ellipsis-vertical"></i>
                     </button>
                   </td>
                 </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersView;
