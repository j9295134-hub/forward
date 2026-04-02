import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminPackages: React.FC = () => {
  const { packages, deletePackage } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackages = packages.filter((pkg) =>
    pkg.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.current_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, trackingId: string) => {
    if (window.confirm(`Delete package "${trackingId}"? This action cannot be undone.`)) {
      try {
        await deletePackage(id);
        addToast(`Package ${trackingId} deleted successfully`, 'success');
      } catch (error) {
        addToast('Failed to delete package', 'error');
      }
    }
  };

  const getShippingIcon = (route: 'sea' | 'air') => {
    return route === 'sea' ? '🚢' : '✈️';
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(ADMIN_ROUTES.dashboard)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <h1>Manage Packages</h1>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by tracking ID or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.75rem',
            border: '2px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        <Link to={ADMIN_ROUTES.newPackage} className="btn btn-primary">
          ➕ Add New Package
        </Link>
      </div>

      <div className="admin-table">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Route</th>
                <th>Status</th>
                <th>Current Location</th>
                <th>Origin → Destination</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{pkg.tracking_id}</td>
                    <td>
                      {getShippingIcon(pkg.shipping_route)} {pkg.shipping_route === 'sea' ? 'Sea Freight' : 'Air Freight'}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(47, 143, 91, 0.16)',
                        color: '#2f8f5b'
                      }}>
                        {pkg.status}
                      </span>
                    </td>
                    <td>{pkg.current_location}</td>
                    <td>{pkg.origin} → {pkg.destination}</td>
                    <td>{new Date(pkg.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={ADMIN_ROUTES.packageEdit(pkg.id)} className="btn btn-secondary btn-sm">
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(pkg.id, pkg.tracking_id)}
                          className="btn btn-danger btn-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {searchTerm ? 'No packages found matching your search' : 'No packages yet. Create your first package!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPackages;
