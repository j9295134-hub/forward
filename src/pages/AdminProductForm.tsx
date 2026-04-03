import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, addProduct, updateProduct, categories } = useData();
  const { addToast } = useToast();

  const product = id && id !== 'new' ? getProductById(id) : null;
  const isEdit = !!product;
  const initialImageUrls =
    product?.image_urls?.length
      ? product.image_urls
      : product?.image_url
        ? [product.image_url]
        : [];

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price_estimate: product?.price_estimate || 0,
    category_id: product?.category_id || '',
    image_url: initialImageUrls[0] || '',
    image_urls: initialImageUrls,
    is_featured: product?.is_featured || false,
    status: product?.status || 'preorder',
    estimated_delivery: product?.estimated_delivery || '45-50 days',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncImages = (imageUrls: string[]) => ({
    image_urls: imageUrls,
    image_url: imageUrls[0] || '',
  });

  const appendImageUrls = (imageUrls: string[]) => {
    const normalizedUrls = imageUrls.map((url) => url.trim()).filter(Boolean);

    if (normalizedUrls.length === 0) {
      return false;
    }

    const existingUrls = new Set(formData.image_urls);
    const nextUrls = normalizedUrls.filter((url) => !existingUrls.has(url));

    if (nextUrls.length === 0) {
      addToast('Those images are already attached to this product', 'warning');
      return false;
    }

    setFormData((prev) => {
      const mergedUrls = [...prev.image_urls];

      nextUrls.forEach((url) => {
        if (!mergedUrls.includes(url)) {
          mergedUrls.push(url);
        }
      });

      return {
        ...prev,
        ...syncImages(mergedUrls),
      };
    });

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'mo7istw9');

        const res = await fetch('https://api.cloudinary.com/v1_1/dqpy0ddog/image/upload', {
          method: 'POST',
          body: data,
        });
        const json = await res.json();

        if (!json.secure_url) {
          throw new Error('Upload did not return an image URL');
        }

        uploadedUrls.push(json.secure_url);
      }

      if (appendImageUrls(uploadedUrls)) {
        addToast(
          `${uploadedUrls.length} image${uploadedUrls.length === 1 ? '' : 's'} added to this product`,
          'success'
        );
      }
    } catch {
      addToast('Image upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'price_estimate' ? parseFloat(value) : value,
    }));
  };

  const handleAddImageUrl = () => {
    if (!manualImageUrl.trim()) {
      addToast('Paste an image URL first', 'error');
      return;
    }

    if (appendImageUrls([manualImageUrl])) {
      setManualImageUrl('');
      addToast('Image added to this product gallery', 'success');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const nextUrls = prev.image_urls.filter((_, index) => index !== indexToRemove);

      return {
        ...prev,
        ...syncImages(nextUrls),
      };
    });
  };

  const handleMakeCover = (indexToPromote: number) => {
    setFormData((prev) => {
      if (indexToPromote <= 0 || indexToPromote >= prev.image_urls.length) {
        return prev;
      }

      const nextUrls = [...prev.image_urls];
      const [selectedImage] = nextUrls.splice(indexToPromote, 1);
      nextUrls.unshift(selectedImage);

      return {
        ...prev,
        ...syncImages(nextUrls),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        addToast('Product name is required', 'error');
        setIsSubmitting(false);
        return;
      }

      if (!formData.category_id) {
        addToast('Please select a category', 'error');
        setIsSubmitting(false);
        return;
      }

      if (formData.image_urls.length === 0) {
        addToast('Add at least one image for this product', 'error');
        setIsSubmitting(false);
        return;
      }

      if (formData.price_estimate <= 0) {
        addToast('Price must be greater than 0', 'error');
        setIsSubmitting(false);
        return;
      }

      const productPayload = {
        ...formData,
        image_url: formData.image_urls[0] || '',
      };

      if (isEdit && product) {
        await updateProduct(product.id, productPayload);
        addToast(`${formData.name} updated successfully!`, 'success');
      } else {
        await addProduct(productPayload);
        addToast(`${formData.name} added successfully!`, 'success');
      }

      navigate(ADMIN_ROUTES.products);
      setIsSubmitting(false);
    } catch {
      addToast('An error occurred', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(ADMIN_ROUTES.products)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <div className="admin-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Wireless Headphones"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed product description..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price_estimate">Estimated Price ($) *</label>
              <input
                type="number"
                id="price_estimate"
                name="price_estimate"
                value={formData.price_estimate}
                onChange={handleInputChange}
                placeholder="45.99"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="in_stock">In Stock</option>
                <option value="preorder">Pre-order</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manual_image_url">Product Gallery *</label>
              <p style={{ marginTop: 0, marginBottom: '0.75rem', color: 'var(--text-light)' }}>
                Add only pictures for this product. The first image becomes the cover image shown in shop and cart views.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />

              <button
                type="button"
                className="btn btn-outline"
                style={{ marginBottom: '0.5rem', width: '100%' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Image(s) from Device'}
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                <input
                  type="url"
                  id="manual_image_url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="Or paste one image URL and click Add"
                />
                <button type="button" onClick={handleAddImageUrl} className="btn btn-secondary">
                  Add URL
                </button>
              </div>

              {formData.image_urls.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                  {formData.image_urls.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '96px minmax(0, 1fr)',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        backgroundColor: 'var(--light-bg)',
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`${formData.name || 'Product'} image ${index + 1}`}
                        style={{
                          width: '96px',
                          height: '96px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1px solid rgba(var(--primary-rgb), 0.12)',
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-dark)' }}>
                          {index === 0 ? 'Cover Image' : `Gallery Image ${index + 1}`}
                        </p>
                        <p
                          style={{
                            margin: '0.45rem 0 0.75rem',
                            color: 'var(--text-light)',
                            fontSize: '0.9rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {imageUrl}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMakeCover(index)}
                              className="btn btn-outline btn-sm"
                            >
                              Make Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-light)',
                    backgroundColor: '#fafdfb',
                  }}
                >
                  No images added yet. Add the front view, side view, close-up, or any other pictures for this same product here.
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="estimated_delivery">Estimated Delivery</label>
              <input
                type="text"
                id="estimated_delivery"
                name="estimated_delivery"
                value={formData.estimated_delivery}
                onChange={handleInputChange}
                placeholder="e.g., 45-50 days"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
              />
              <label htmlFor="is_featured" style={{ margin: 0 }}>
                Mark as Featured Product
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate(ADMIN_ROUTES.products)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
