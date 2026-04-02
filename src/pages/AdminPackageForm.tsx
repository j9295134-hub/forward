import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminPackageForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addPackage, updatePackage, getPackageById } = useData();
  const { addToast } = useToast();

  const isEditMode = !!id;
  const existingPackage = isEditMode ? getPackageById(id) : null;

  const [formData, setFormData] = useState({
    tracking_id: '',
    status: 'Order Made',
    shipping_route: 'sea' as 'sea' | 'air',
    current_location: 'China',
    origin: 'China',
    destination: 'Ghana',
    estimated_delivery: '45-50 days',
  });

  useEffect(() => {
    if (existingPackage) {
      setFormData({
        tracking_id: existingPackage.tracking_id,
        status: existingPackage.status,
        shipping_route: existingPackage.shipping_route,
        current_location: existingPackage.current_location,
        origin: existingPackage.origin,
        destination: existingPackage.destination,
        estimated_delivery: existingPackage.estimated_delivery || '45-50 days',
      });
    }
  }, [existingPackage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tracking_id.trim()) {
      addToast('Please enter a tracking ID', 'error');
      return;
    }

    if (!formData.status.trim()) {
      addToast('Please enter a status', 'error');
      return;
    }

    if (!formData.current_location.trim()) {
      addToast('Please enter current location', 'error');
      return;
    }

    try {
      if (isEditMode && id) {
        await updatePackage(id, formData);
        addToast(`Package ${formData.tracking_id} updated successfully`, 'success');
      } else {
        await addPackage(formData);
        addToast(`Package ${formData.tracking_id} created successfully`, 'success');
      }
      navigate(ADMIN_ROUTES.packages);
    } catch (error) {
      addToast('An error occurred', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateTrackingId = () => {
    const prefix = formData.shipping_route === 'sea' ? 'SEA' : 'AIR';
    const randomNum = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    setFormData((prev) => ({
      ...prev,
      tracking_id: `${prefix}-${timestamp}-${randomNum}`,
    }));
  };

  const commonStatuses = [
    'Order Made',
    'Processing',
    'Dispatched from China',
    'In Transit to Ghana',
    'Arrived at Port',
    'Customs Clearance',
    'Out for Delivery',
    'Delivered',
  ];

  const commonLocations = [
    'China - Warehouse',
    'China - Port of Departure',
    'In Transit',
    'Ghana - Port of Arrival',
    'Ghana - Customs',
    'Ghana - Distribution Center',
    'Ghana - Out for Delivery',
  ];

  return (
    <div>
      <button onClick={() => navigate(ADMIN_ROUTES.packages)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Back to Packages
      </button>

      <h1>{isEditMode ? 'Edit Package' : 'Create New Package'}</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="tracking_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Tracking ID *
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              id="tracking_id"
              name="tracking_id"
              value={formData.tracking_id}
              onChange={handleChange}
              placeholder="e.g., SEA-123456-ABC789"
              required
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'monospace',
              }}
            />
            {!isEditMode && (
              <button
                type="button"
                onClick={generateTrackingId}
                className="btn btn-secondary"
              >
                Generate
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="shipping_route" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Shipping Route *
          </label>
          <select
            id="shipping_route"
            name="shipping_route"
            value={formData.shipping_route}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          >
            <option value="sea">🚢 Sea Freight (China to Ghana)</option>
            <option value="air">✈️ Air Freight (China to Ghana)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label htmlFor="origin" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Origin
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="e.g., China"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label htmlFor="destination" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Destination
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., Ghana"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Package Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          >
            {commonStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="current_location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Current Location *
          </label>
          <select
            id="current_location"
            name="current_location"
            value={formData.current_location}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          >
            {commonLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="estimated_delivery" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Estimated Delivery
          </label>
          <input
            type="text"
            id="estimated_delivery"
            name="estimated_delivery"
            value={formData.estimated_delivery}
            onChange={handleChange}
            placeholder="e.g., 45-50 days or March 15, 2026"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Package' : 'Create Package'}
          </button>
          <button type="button" onClick={() => navigate(ADMIN_ROUTES.packages)} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageForm;
