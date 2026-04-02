import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsAPI, categoriesAPI, packagesAPI, settingsAPI } from '../utils/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price_estimate: number;
  category_id: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  status?: 'in_stock' | 'preorder';
  estimated_delivery?: string;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface AppSettings {
  whatsappNumber: string;
  brandName: string;
}

export interface Package {
  id: string;
  tracking_id: string;
  status: string;
  shipping_route: 'sea' | 'air';
  current_location: string;
  origin: string;
  destination: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  packages: Package[];
  settings: AppSettings;
  loading: boolean;
  updateSetting: (key: string, value: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
  addPackage: (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  getPackageById: (id: string) => Package | undefined;
  getPackageByTrackingId: (trackingId: string) => Package | undefined;
}

// Map backend camelCase response to frontend snake_case
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price_estimate: p.price ?? p.price_estimate,
  category_id: p.categoryId ?? p.category_id,
  image_url: p.image ?? p.image_url,
  is_featured: p.isFeatured === 1 || p.isFeatured === true || p.is_featured === true,
  created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
  status: p.status ?? 'in_stock',
  estimated_delivery: p.estimatedDelivery ?? p.estimated_delivery,
  stock: p.stock ?? 0,
});

const mapCategory = (c: any): Category => ({
  id: c.id,
  name: c.name,
  slug: c.slug ?? c.name.toLowerCase().replace(/\s+/g, '-'),
});

const mapPackage = (p: any): Package => ({
  id: p.id,
  tracking_id: p.trackingId ?? p.tracking_id,
  status: p.status,
  shipping_route: (p.shippingRoute ?? p.shipping_route ?? 'sea') as 'sea' | 'air',
  current_location: p.currentLocation ?? p.current_location ?? '',
  origin: p.origin ?? '',
  destination: p.destination ?? '',
  created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
  updated_at: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
  estimated_delivery: p.estimatedDelivery ?? p.estimated_delivery,
});

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '',
    brandName: import.meta.env.VITE_BRAND_NAME || 'HopeLink Imports',
  });
  const [loading, setLoading] = useState(true);

  // Fetch all data from the API on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodsResult, catsResult, pkgsResult, settingsResult] = await Promise.allSettled([
          productsAPI.getAll(),
          categoriesAPI.getAll(),
          packagesAPI.getAll(),
          settingsAPI.getAll(),
        ]);
        if (prodsResult.status === 'fulfilled') setProducts((prodsResult.value || []).map(mapProduct));
        if (catsResult.status === 'fulfilled') setCategories((catsResult.value || []).map(mapCategory));
        if (pkgsResult.status === 'fulfilled') setPackages((pkgsResult.value || []).map(mapPackage));
        if (settingsResult.status === 'fulfilled') {
          const raw = settingsResult.value;
          setSettings(prev => ({
            whatsappNumber: raw.whatsapp_number || prev.whatsappNumber,
            brandName: raw.brand_name || prev.brandName,
          }));
        }
      } catch (err) {
        console.error('Failed to load data from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at'>) => {
    const data = await productsAPI.create({
      name: product.name,
      description: product.description,
      price: product.price_estimate,
      categoryId: product.category_id,
      image: product.image_url,
      isFeatured: product.is_featured,
      status: product.status,
      estimatedDelivery: product.estimated_delivery,
    });
    setProducts((prev) => [mapProduct(data), ...prev]);
  }, []);

  const updateProduct = useCallback(async (id: string, updatedProduct: Partial<Product>) => {
    const data = await productsAPI.update(id, {
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price_estimate,
      categoryId: updatedProduct.category_id,
      image: updatedProduct.image_url,
      isFeatured: updatedProduct.is_featured,
      status: updatedProduct.status,
      estimatedDelivery: updatedProduct.estimated_delivery,
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...mapProduct({ ...p, ...data }) } : p))
    );
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await productsAPI.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const data = await categoriesAPI.create({ name: category.name, slug: category.slug });
    setCategories((prev) => [mapCategory(data), ...prev]);
  }, []);

  const updateCategory = useCallback(async (id: string, updatedCategory: Partial<Category>) => {
    const data = await categoriesAPI.update(id, { name: updatedCategory.name, slug: updatedCategory.slug });
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...mapCategory({ ...c, ...data }) } : c))
    );
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await categoriesAPI.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const addPackage = useCallback(async (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    const data = await packagesAPI.create({
      trackingId: pkg.tracking_id,
      status: pkg.status,
      shippingRoute: pkg.shipping_route,
      origin: pkg.origin,
      destination: pkg.destination,
      currentLocation: pkg.current_location,
      estimatedDelivery: pkg.estimated_delivery,
    });
    setPackages((prev) => [mapPackage(data), ...prev]);
  }, []);

  const updatePackage = useCallback(async (id: string, updatedPackage: Partial<Package>) => {
    const data = await packagesAPI.update(id, {
      status: updatedPackage.status,
      shippingRoute: updatedPackage.shipping_route,
      currentLocation: updatedPackage.current_location,
      estimatedDelivery: updatedPackage.estimated_delivery,
    });
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...mapPackage({ ...p, ...data }) } : p))
    );
  }, []);

  const deletePackage = useCallback(async (id: string) => {
    await packagesAPI.delete(id);
    setPackages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPackageById = useCallback(
    (id: string) => packages.find((p) => p.id === id),
    [packages]
  );

  const getPackageByTrackingId = useCallback(
    (trackingId: string) =>
      packages.find((p) => p.tracking_id.toUpperCase() === trackingId.toUpperCase()),
    [packages]
  );

  const updateSetting = useCallback(async (key: string, value: string) => {
    await settingsAPI.update(key, value);
    setSettings(prev => ({
      ...prev,
      ...(key === 'whatsapp_number' ? { whatsappNumber: value } : {}),
      ...(key === 'brand_name' ? { brandName: value } : {}),
    }));
  }, []);

  const value: DataContextType = {
    products,
    categories,
    packages,
    settings,
    loading,
    updateSetting,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    getProductById,
    getCategoryById,
    addPackage,
    updatePackage,
    deletePackage,
    getPackageById,
    getPackageByTrackingId,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
