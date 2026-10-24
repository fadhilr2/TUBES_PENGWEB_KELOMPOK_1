import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import KatalogPage from './pages/KatalogPage';
import TambahJasaPage from './pages/TambahJasaPage';
import DetailJasaPage from './pages/DetailJasaPage';
import OrderPage from './pages/OrderPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/katalog" element={<KatalogPage />} />
        <Route path="/katalog.html" element={<Navigate to="/katalog" replace />} />
        <Route path="/tambah-jasa" element={<TambahJasaPage />} />
        <Route path="/tambah-jasa.html" element={<Navigate to="/tambah-jasa" replace />} />
        <Route path="/detail-jasa" element={<DetailJasaPage />} />
        <Route path="/detail-jasa.html" element={<Navigate to="/detail-jasa" replace />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/order.html" element={<Navigate to="/order" replace />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
