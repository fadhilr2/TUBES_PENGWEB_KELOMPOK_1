import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DemoProvider, useDemo } from './state/DemoContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { EmptyState, Notice } from './components/UI';
import HomePage from './pages/HomePage';
import KatalogPage from './pages/KatalogPage';
import DetailJasaPage from './pages/DetailJasaPage';
import TambahJasaPage from './pages/TambahJasaPage';
import MyServicesPage from './pages/MyServicesPage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import HistoryPage from './pages/HistoryPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const memberRoles = ['pencari', 'penyedia'];
const providerRoles = ['penyedia'];
const adminRoles = ['admin'];

function Guard({ children, roles, required = true }) {
  const { user } = useDemo();
  const location = useLocation();

  if (!user && required) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from: from }} />;
  }

  if (user && roles && !roles.includes(user.role)) {
    let fallback = '/profil';
    if (user.role === 'admin') {
      fallback = '/admin';
    }
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  return (
    <Guard roles={memberRoles} required={false}>
      {children}
    </Guard>
  );
}

function MemberRoute({ children }) {
  return <Guard roles={memberRoles}>{children}</Guard>;
}

function ProviderRoute({ children }) {
  return <Guard roles={providerRoles}>{children}</Guard>;
}

function AdminRoute({ children }) {
  return <Guard roles={adminRoles}>{children}</Guard>;
}

function NotFound() {
  return (
    <main className="page-section">
      <div className="container">
        <EmptyState
          title="Halaman tidak ditemukan."
          description="Buka navigasi untuk kembali ke ruang berkaryamu."
        />
      </div>
    </main>
  );
}

function ErrorPage({ error }) {
  let message = String(error);
  if (error.message) {
    message = error.message;
  }

  function handleReload() {
    window.location.reload();
  }

  return (
    <main className="page-section">
      <div className="container">
        <Notice type="error">{message}</Notice>
        <button className="button button-blue" onClick={handleReload}>
          Coba lagi
        </button>
      </div>
    </main>
  );
}

function LoadingPage() {
  return (
    <main className="loading-page" role="status">
      <span className="brand-symbol">✳</span>
      <p>Menyiapkan ruang berkarya…</p>
    </main>
  );
}

function Shell() {
  const { ready, error } = useDemo();

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!ready) {
    return <LoadingPage />;
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/katalog"
          element={
            <PublicRoute>
              <KatalogPage key="catalog" />
            </PublicRoute>
          }
        />
        <Route
          path="/favorit"
          element={
            <MemberRoute>
              <KatalogPage key="favorites" />
            </MemberRoute>
          }
        />
        <Route
          path="/detail-jasa"
          element={
            <PublicRoute>
              <DetailJasaPage />
            </PublicRoute>
          }
        />
        <Route
          path="/detail-jasa/:serviceId"
          element={
            <PublicRoute>
              <DetailJasaPage />
            </PublicRoute>
          }
        />
        <Route
          path="/tambah-jasa"
          element={
            <MemberRoute>
              <TambahJasaPage />
            </MemberRoute>
          }
        />
        <Route
          path="/edit-jasa/:serviceId"
          element={
            <ProviderRoute>
              <TambahJasaPage />
            </ProviderRoute>
          }
        />
        <Route
          path="/jasa-saya"
          element={
            <MemberRoute>
              <MyServicesPage />
            </MemberRoute>
          }
        />
        <Route
          path="/order"
          element={
            <MemberRoute>
              <OrderPage />
            </MemberRoute>
          }
        />
        <Route
          path="/pembayaran/:orderId"
          element={
            <MemberRoute>
              <PaymentPage />
            </MemberRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <MemberRoute>
              <HistoryPage />
            </MemberRoute>
          }
        />
        <Route
          path="/dashboard-penyedia"
          element={
            <ProviderRoute>
              <ProviderDashboardPage />
            </ProviderRoute>
          }
        />
        <Route path="/login" element={<AuthPage key="login" />} />
        <Route path="/register" element={<AuthPage key="register" />} />
        <Route
          path="/profil"
          element={
            <Guard>
              <ProfilePage />
            </Guard>
          }
        />
        <Route path="/daftar-penyedia" element={<Navigate to="/profil" replace />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </DemoProvider>
  );
}
