import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        <Route path="/katalog" element={<KatalogPage />} />
        <Route path="/tambah-jasa" element={<TambahJasaPage />} />
        <Route path="/detail-jasa" element={<DetailJasaPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
