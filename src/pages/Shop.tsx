import React, { useState, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ProductCard from '../components/common/ProductCard';
import './Pages.css';

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

const getVisiblePages = (currentPage: number, totalPages: number): PaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-left', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-left', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-right', totalPages];
};

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, categories, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const shuffleCacheRef = useRef<{ key: string; items: typeof products }>({ key: '', items: [] });

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        product.category_id === selectedCategory ||
        categories.find((category) => category.slug === selectedCategory)?.id === product.category_id;

      return matchesSearch && matchesCategory;
    });

    if (!selectedCategory) {
      const key = filtered.map((product) => product.id).join(',');
      if (key !== shuffleCacheRef.current.key) {
        const shuffled = [...filtered];
        for (let index = shuffled.length - 1; index > 0; index--) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        shuffleCacheRef.current = { key, items: shuffled };
      }
      return shuffleCacheRef.current.items;
    }

    return filtered;
  }, [products, categories, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const visiblePages = useMemo(
    () => getVisiblePages(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  );
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  return (
    <div className="shop-page">
      <div className="container">
        <h1>Shop</h1>

        <div className="shop-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="search-icon-btn" onClick={() => handleSearch(searchTerm)} aria-label="Search">
              <Search size={18} />
            </button>
          </div>

          <div className="shop-filters">
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: 'var(--text-light)' }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="no-products">
            <p>Loading products...</p>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div key={safeCurrentPage} className="grid grid-3 products-grid">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  {'< Previous'}
                </button>

                {visiblePages.map((page) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={safeCurrentPage === page ? 'active' : ''}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={page} className="pagination-ellipsis" aria-hidden="true">
                      ...
                    </span>
                  )
                )}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  {'Next >'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products">
            <h2>No products found</h2>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
