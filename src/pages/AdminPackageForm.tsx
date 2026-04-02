import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData, type PackageItem } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import { normalizeTrackingId } from '../utils/tracking';
import '../components/admin/Admin.css';

const AdminPackageForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addPackage, updatePackage, getPackageById, products } = useData();
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
    package_items: [] as PackageItem[],
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

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
        package_items: existingPackage.package_items || [],
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
      [name]: name === 'tracking_id' ? normalizeTrackingId(value) : value,
    }));
  };

  const generateTrackingId = () => {
    const prefix = formData.shipping_route === 'sea' ? 'SEA' : 'AIR';
    const randomNum = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    setFormData((prev) => ({
      ...prev,
      tracking_id: normalizeTrackingId(`${prefix}-${timestamp}-${randomNum}`),
    }));
  };

  const addSelectedProduct = () => {
    if (!selectedProductId) {
      addToast('Please choose a product to attach', 'error');
      return;
    }

    const product = products.find((item) => item.id === selectedProductId);

    if (!product) {
      addToast('That product is no longer available', 'error');
      return;
    }

    const quantity = Math.max(1, Math.round(selectedQuantity) || 1);

    setFormData((prev) => {
      const existingItemIndex = prev.package_items.findIndex((item) => item.product_id === product.id);

      if (existingItemIndex >= 0) {
        return {
          ...prev,
          package_items: prev.package_items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...prev,
        package_items: [
          ...prev.package_items,
          {
            product_id: product.id,
            name: product.name,
            image_url: product.image_url,
            quantity,
          },
        ],
      };
    });

    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const updatePackageItemQuantity = (index: number, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      package_items: prev.package_items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: Math.max(1, Math.round(quantity) || 1) }
          : item
      ),
    }));
  };

  const removePackageItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      package_items: prev.package_items.filter((_, itemIndex) => itemIndex !== index),
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Package Contents
          </label>
          <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
            Choose products from your catalog. We save the current product name, thumbnail URL, and quantity on this package so the tracking page can show them later.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 120px auto',
            gap: '0.75rem',
            alignItems: 'end',
            marginBottom: '1rem'
          }}>
            <div>
              <label htmlFor="package_product" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Product
              </label>
              <select
                id="package_product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="package_quantity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Quantity
              </label>
              <input
                type="number"
                id="package_quantity"
                min={1}
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value) || 1))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <button type="button" onClick={addSelectedProduct} className="btn btn-secondary">
              Add Item
            </button>
          </div>

          {formData.package_items.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {formData.package_items.map((item, index) => (
                <div
                  key={`${item.product_id ?? item.name}-${index}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px minmax(0, 1fr) 110px auto',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    backgroundColor: 'var(--light-bg)',
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: '72px',
                        height: '72px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '1px solid rgba(var(--primary-rgb), 0.12)',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '10px',
                      backgroundColor: '#e9f6ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: 'var(--primary-dark)',
                    }}>
                      {index + 1}
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: 600 }}>
                      {index + 1}. {item.name}
                    </p>
                    <p style={{ margin: '0.35rem 0 0', color: 'var(--text-light)', fontSize: '0.95rem' }}>
                      Saved as a package snapshot
                    </p>
                  </div>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updatePackageItemQuantity(index, Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />

                  <button type="button" onClick={() => removePackageItem(index)} className="btn btn-outline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '1rem',
              border: '1px dashed var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-light)',
              backgroundColor: '#fafdfb',
            }}>
              No products attached yet. Tracking will still work, but the customer will only see shipping details.
            </div>
          )}
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
