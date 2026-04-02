import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { settings } = useData();
  const { addToast } = useToast();
  const brandName = settings.brandName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (await login(email, password)) {
        addToast('Login successful!', 'success');
        navigate(ADMIN_ROUTES.dashboard);
      } else {
        addToast('Invalid email or password', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Admin Dashboard</h1>
          <p className="login-subtitle">Manage your {brandName} products and categories</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="login-info">
              <p><strong>Secure Admin Access</strong></p>
              <p>Use the admin email and password configured on the backend for this deployment.</p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>

        <div className="login-sidebar">
          <h2>Admin Features</h2>
          <ul>
            <li>📦 Manage Products</li>
            <li>🏷️ Manage Categories</li>
            <li>📊 View Dashboard Analytics</li>
            <li>🔍 Monitor Recent Products</li>
            <li>✏️ Edit Product Details</li>
            <li>🗑️ Delete Products</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
