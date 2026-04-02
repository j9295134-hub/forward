import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './utils/Toast';

// Components
import Layout from './components/common/Layout';
import WhatsAppButton from './components/common/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import CustomOrder from './pages/CustomOrder';
import TrackOrder from './pages/TrackOrder';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminCategories from './pages/AdminCategories';
import AdminPackages from './pages/AdminPackages';
import AdminPackageForm from './pages/AdminPackageForm';
import { ADMIN_ROUTES } from './utils/adminRoutes';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <ToastProvider>
            <Router>
              <ScrollToTop />
              <WhatsAppButton />
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Home />
                    </Layout>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <Layout>
                      <Shop />
                    </Layout>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <Layout>
                      <ProductDetails />
                    </Layout>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <Layout>
                      <Cart />
                    </Layout>
                  }
                />
                <Route
                  path="/custom-order"
                  element={
                    <Layout>
                      <CustomOrder />
                    </Layout>
                  }
                />
                <Route
                  path="/track-order"
                  element={
                    <Layout>
                      <TrackOrder />
                    </Layout>
                  }
                />

                {/* Admin Routes */}
                <Route path={ADMIN_ROUTES.login} element={<AdminLogin />} />

                <Route
                  path={ADMIN_ROUTES.dashboard}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ADMIN_ROUTES.products}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminProducts />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ADMIN_ROUTES.newProduct}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminProductForm />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={`${ADMIN_ROUTES.products}/:id/edit`}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminProductForm />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ADMIN_ROUTES.categories}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminCategories />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ADMIN_ROUTES.packages}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminPackages />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ADMIN_ROUTES.newPackage}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminPackageForm />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={`${ADMIN_ROUTES.packages}/:id/edit`}
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminPackageForm />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 - Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
