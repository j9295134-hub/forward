import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_ROUTES } from '../../utils/adminRoutes';
import './Admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ADMIN_ROUTES.login);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ position: 'relative' }}>
        <button
          className="menu-toggle"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            display: 'none',
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <h3>Admin Menu</h3>
        <ul>
          <li>
            <Link
              to={ADMIN_ROUTES.dashboard}
              className={isActive(ADMIN_ROUTES.dashboard) ? 'active' : ''}
              onClick={() => setIsSidebarOpen(false)}
            >
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN_ROUTES.products}
              className={isActive(ADMIN_ROUTES.products) ? 'active' : ''}
              onClick={() => setIsSidebarOpen(false)}
            >
              📦 Products
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN_ROUTES.categories}
              className={isActive(ADMIN_ROUTES.categories) ? 'active' : ''}
              onClick={() => setIsSidebarOpen(false)}
            >
              🏷️ Categories
            </Link>
          </li>
          <li>
            <Link
              to={ADMIN_ROUTES.packages}
              className={isActive(ADMIN_ROUTES.packages) ? 'active' : ''}
              onClick={() => setIsSidebarOpen(false)}
            >
              📦 Track Orders
            </Link>
          </li>
        </ul>

        <button onClick={handleLogout} className="logout-btn" style={{ position: 'relative', bottom: 'auto', marginTop: '2rem' }}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <button
          className="menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            display: 'none',
            marginBottom: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-dark)',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          <Menu size={24} />
        </button>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-layout {
            grid-template-columns: 1fr;
          }

          .admin-sidebar {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            bottom: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            z-index: 99;
          }

          .admin-sidebar.open {
            max-height: 100vh;
            padding: 2rem 0;
          }

          .admin-sidebar .menu-toggle {
            display: block !important;
          }

          .admin-main > .menu-toggle {
            display: block !important;
          }

          .admin-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
