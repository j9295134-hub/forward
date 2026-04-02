import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { generateSlug } from '../utils/helpers';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setFormData({ name: '', slug: '' });
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug });
  };

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    if (!formData.slug.trim()) {
      addToast('Slug cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        addToast(`${formData.name} updated successfully!`, 'success');
      } else {
        await addCategory(formData);
        addToast(`${formData.name} added successfully!`, 'success');
      }
      setIsAddingNew(false);
      setEditingId(null);
      setFormData({ name: '', slug: '' });
    } catch (error) {
      addToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const productCount = products.filter((p) => p.category_id === id).length;
    
    if (productCount > 0) {
      addToast(
        `Cannot delete "${name}" - ${productCount} product(s) in this category. Please move or delete them first.`,
        'warning'
      );
      return;
    }

    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteCategory(id);
        addToast(`${name} deleted successfully`, 'success');
      } catch (error) {
        addToast('Failed to delete category', 'error');
      }
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ name: '', slug: '' });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(ADMIN_ROUTES.dashboard)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <h1>Manage Categories</h1>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <div className="admin-form" style={{ marginBottom: '2rem' }}>
          <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="categoryName">Category Name *</label>
              <input
                type="text"
                id="categoryName"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Electronics"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categorySlug">Slug (auto-generated)</label>
              <input
                type="text"
                id="categorySlug"
                value={formData.slug}
                readOnly
                placeholder="electronics"
              />
              <div className="form-info" style={{ fontSize: '0.85rem' }}>
                Slug is automatically generated from the category name
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingId ? '💾 Update Category' : '➕ Add Category'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-outline" disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="admin-table">
        <div className="admin-table-header">
          <h2 style={{ margin: 0 }}>Categories</h2>
          {!isAddingNew && !editingId && (
            <button onClick={handleAddNew} className="btn btn-primary btn-sm">
              <Plus size={18} />
              Add Category
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => {
                  const productCount = products.filter((p) => p.category_id === category.id).length;
                  return (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>
                        <code style={{
                          backgroundColor: 'var(--light-bg)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {category.slug}
                        </code>
                      </td>
                      <td>{productCount}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleEdit(category)}
                            className="btn btn-secondary btn-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="btn btn-danger btn-sm"
                            disabled={productCount > 0}
                            title={productCount > 0 ? 'Delete products in this category first' : ''}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                    No categories yet
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

export default AdminCategories;
