import React, { useState, useEffect } from 'react';
import './OrderFulfillment.css';

const OrderFulfillment = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authentication check
  const handleAuth = () => {
    if (adminKey) {
      setIsAuthenticated(true);
      fetchOrders();
    }
  };

  // Fetch orders from admin API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      const response = await fetch(`/api/admin/fulfillment?${params}`, {
        headers: {
          'X-Admin-Key': adminKey
        }
      });
      
      if (response.status === 401) {
        setError('Authentication failed. Please check your admin key.');
        setIsAuthenticated(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, action, trackingInfo = null) => {
    try {
      const response = await fetch('/api/admin/fulfillment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({
          orderId,
          action,
          trackingInfo
        })
      });
      
      if (response.status === 401) {
        alert('Authentication failed. Please check your admin key and try again.');
        setIsAuthenticated(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      alert(result.message || 'Order updated successfully');
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error('Order update error:', err);
      alert('Error updating order: ' + err.message);
    }
  };

  // Handle mark as shipped
  const handleMarkShipped = (orderId) => {
    const trackingNumber = prompt('Enter tracking number:');
    const carrier = prompt('Enter carrier (e.g., UPS, FedEx, USPS):');
    const trackingUrl = prompt('Enter tracking URL (optional):');
    
    if (trackingNumber && carrier) {
      updateOrderStatus(orderId, 'mark_shipped', {
        trackingNumber,
        carrier,
        trackingUrl: trackingUrl || undefined
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [selectedStatus, isAuthenticated]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#28a745';
      case 'delivered': return '#6f42c1';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-auth">
        <div className="auth-container">
          <h2>Admin Access</h2>
          <div className="auth-form">
            <input
              type="password"
              placeholder="Enter admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button onClick={handleAuth}>Access Admin Panel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-fulfillment">
      <div className="container">
        <div className="admin-header">
          <h1>Order Fulfillment Dashboard</h1>
          <div className="admin-controls">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={fetchOrders} className="refresh-btn">
              Refresh
            </button>
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setAdminKey('');
                setOrders([]);
                setError(null);
              }} 
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && <div className="loading">Loading orders...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Shipping Address</th>
                  <th>Tracking</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-number">
                      #{order.orderNumber.slice(-8)}
                    </td>
                    <td className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      <div className="customer-email">{order.customerEmail}</div>
                      {order.customerPhone && (
                        <div className="customer-phone">{order.customerPhone}</div>
                      )}
                    </td>
                    <td className="amount">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.fulfillmentStatus) }}
                      >
                        {order.fulfillmentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="order-date">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="items">
                      {order.items.map((item, index) => (
                        <div key={index} className="item">
                          {item.name} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="shipping-address">
                      <div>{order.shippingAddress.name}</div>
                      <div>{order.shippingAddress.line1}</div>
                      <div>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </div>
                    </td>
                    <td className="tracking">
                      {order.tracking.number ? (
                        <div>
                          <div><strong>{order.tracking.carrier}</strong></div>
                          <div>{order.tracking.number}</div>
                          {order.tracking.url && (
                            <a href={order.tracking.url} target="_blank" rel="noopener noreferrer">
                              Track Package
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="no-tracking">No tracking</span>
                      )}
                    </td>
                    <td className="actions">
                      <div className="action-buttons">
                        {order.fulfillmentStatus === 'pending' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'mark_processing')}
                            className="btn-processing"
                          >
                            Mark Processing
                          </button>
                        )}
                        {(order.fulfillmentStatus === 'pending' || order.fulfillmentStatus === 'processing' || order.fulfillmentStatus === 'paid') && (
                          <button 
                            onClick={() => handleMarkShipped(order.id)}
                            className="btn-shipped"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.fulfillmentStatus === 'shipped' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'mark_delivered')}
                            className="btn-delivered"
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'mark_cancelled')}
                          className="btn-cancelled"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="no-orders">
                No orders found for the selected status.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFulfillment;