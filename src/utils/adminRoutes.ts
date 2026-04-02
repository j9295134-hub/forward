export const ADMIN_BASE = '/hopedey';

export const ADMIN_ROUTES = {
  login: ADMIN_BASE,
  dashboard: `${ADMIN_BASE}/dashboard`,
  products: `${ADMIN_BASE}/products`,
  newProduct: `${ADMIN_BASE}/products/new`,
  productEdit: (id: string) => `${ADMIN_BASE}/products/${id}/edit`,
  categories: `${ADMIN_BASE}/categories`,
  packages: `${ADMIN_BASE}/packages`,
  newPackage: `${ADMIN_BASE}/packages/new`,
  packageEdit: (id: string) => `${ADMIN_BASE}/packages/${id}/edit`,
};
