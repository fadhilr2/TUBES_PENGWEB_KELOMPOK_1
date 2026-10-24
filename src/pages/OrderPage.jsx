import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './OrderPage.css';

const PACKAGES = {
  basic: {
    name: 'Paket Basic',
    desc: 'Maks. 30 detik, 1x revisi',
    price: 50000,
    priceFormatted: 'Rp 50.000',
    fee: 2500,
    feeFormatted: 'Rp 2.500',
    total: 52500,
    totalFormatted: 'Rp 52.500'
  },
  standard: {
    name: 'Paket Standard',
    desc: 'Maks. 60 detik, 3x revisi, dengan subtitel',
    price: 100000,
    priceFormatted: 'Rp 100.000',
    fee: 5000,
    feeFormatted: 'Rp 5.000',
    total: 105000,
    totalFormatted: 'Rp 105.000'
  },
  premium: {
    name: 'Paket Premium',
    desc: 'Maks. 3 menit, revisi tak terbatas',
    price: 200000,
    priceFormatted: 'Rp 200.000',
    fee: 10000,
    feeFormatted: 'Rp 10.000',
    total: 210000,
    totalFormatted: 'Rp 210.000'
  }
};

export default function OrderPage() {
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [formData, setFormData] = useState({
    nama_pemesan: '',
    email_pemesan: '',
    wa_pemesan: '',
    deadline: '',
    brief: '',
    metode_bayar: 'bca',
    setuju_sk: false,
    konfirmasi_data: false
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    document.title = 'Konfirmasi & Pesan Jasa — SewaSkill';
  }, []);

  const pkg = PACKAGES[selectedPackage] || PACKAGES.standard;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'paket') {
      setSelectedPackage(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderPlaced(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="order-container">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link to="/">Beranda</Link>
            </li>
            <li className="breadcrumb__item">
              <Link to="/katalog">Katalog</Link>
            </li>
            <li className="breadcrumb__item">
              <Link to="/detail-jasa">Rizky Aditya</Link>
            </li>
            <li className="breadcrumb__item" aria-current="page">
              Pesan Jasa
            </li>
          </ol>
        </nav>

        <h1 className="order-title">Konfirmasi &amp; Pesan Jasa</h1>

        {orderPlaced && (
          <div className="order-alert-success">
            <h3>Pesanan Berhasil Dibuat!</h3>
            <p>
              Instruksi pembayaran telah dikirimkan ke email <strong>{formData.email_pemesan}</strong> dan WhatsApp{' '}
              <strong>{formData.wa_pemesan}</strong>. Dana Anda aman bersama sistem Escrow SewaSkill.
            </p>
          </div>
        )}

        <div className="order-layout">
          {/* Ringkasan Pesanan (ASIDE) */}
          <aside id="ringkasan-order" className="order-card">
            <h2>Ringkasan Pesanan</h2>

            <div className="order-talent">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                alt="Foto profil Rizky Aditya, talent yang jasanya sedang dipesan"
                className="order-talent-img"
                width="72"
                height="72"
              />
              <div className="order-talent-info">
                <p>
                  <strong>Talent:</strong> Rizky Aditya
                </p>
                <p>
                  <strong>Jasa:</strong> Edit Video Pendek — {pkg.name}
                </p>
              </div>
            </div>

            <div className="order-table-wrap">
              <table className="order-table">
                <caption>Rincian biaya pesanan jasa edit video Rizky Aditya — {pkg.name}</caption>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Keterangan</th>
                    <th scope="col">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Jasa Edit Video — {pkg.name}</td>
                    <td>{pkg.desc}</td>
                    <td>{pkg.priceFormatted}</td>
                  </tr>
                  <tr>
                    <td>Biaya Layanan Platform</td>
                    <td>5% dari harga jasa</td>
                    <td>{pkg.feeFormatted}</td>
                  </tr>
                  <tr>
                    <td>Biaya Admin Pembayaran</td>
                    <td>Transfer Bank / E-Wallet</td>
                    <td>Rp 0</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan="2">
                      Total Pembayaran
                    </th>
                    <td>
                      <strong>{pkg.totalFormatted}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="order-estimate">
              <strong>Estimasi Selesai:</strong> 2 hari kerja setelah aset diterima
            </p>
          </aside>

          {/* Form Pemesanan (SECTION) */}
          <section id="form-pemesanan" className="order-card">
            <h2>Isi Data Pemesanan</h2>

            <form onSubmit={handleSubmit}>
              {/* Bagian 1: Data Diri */}
              <fieldset className="order-fieldset">
                <legend>Data Diri Pemesan</legend>

                <div className="order-field">
                  <label htmlFor="nama-pemesan">Nama Lengkap: *</label>
                  <input
                    type="text"
                    id="nama-pemesan"
                    name="nama_pemesan"
                    value={formData.nama_pemesan}
                    onChange={handleChange}
                    placeholder="Contoh: Dinda Rahayu"
                    required
                  />
                </div>

                <div className="order-field">
                  <label htmlFor="email-pemesan">Alamat Email: *</label>
                  <input
                    type="email"
                    id="email-pemesan"
                    name="email_pemesan"
                    value={formData.email_pemesan}
                    onChange={handleChange}
                    placeholder="Contoh: dinda@email.com"
                    required
                  />
                </div>

                <div className="order-field">
                  <label htmlFor="wa-pemesan">Nomor WhatsApp: *</label>
                  <input
                    type="tel"
                    id="wa-pemesan"
                    name="wa_pemesan"
                    value={formData.wa_pemesan}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                    required
                  />
                </div>
              </fieldset>

              {/* Bagian 2: Detail Pesanan */}
              <fieldset className="order-fieldset">
                <legend>Detail Pesanan</legend>

                <div className="order-field">
                  <label htmlFor="pilih-paket">Pilih Paket: *</label>
                  <select
                    id="pilih-paket"
                    name="paket"
                    value={selectedPackage}
                    onChange={handleChange}
                    required
                  >
                    <option value="basic">Paket Basic — Rp 50.000 (Maks. 30 detik, 1x revisi)</option>
                    <option value="standard">Paket Standard — Rp 100.000 (Maks. 60 detik, 3x revisi)</option>
                    <option value="premium">Paket Premium — Rp 200.000 (Maks. 3 menit, revisi tak terbatas)</option>
                  </select>
                </div>

                <div className="order-field">
                  <label htmlFor="deadline">Tanggal Deadline yang Diinginkan:</label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                  <small>Opsional. Pengerjaan standar 2–3 hari kerja.</small>
                </div>

                <div className="order-field">
                  <label htmlFor="brief-proyek">Brief Proyek / Catatan untuk Talent: *</label>
                  <textarea
                    id="brief-proyek"
                    name="brief"
                    rows="5"
                    cols="50"
                    value={formData.brief}
                    onChange={handleChange}
                    placeholder="Jelaskan detail proyek kamu: tema video, gaya editing yang diinginkan, referensi video sejenis, dll."
                    required
                  ></textarea>
                </div>

                <div className="order-field">
                  <label htmlFor="upload-aset">Upload Bahan / Aset Proyek (Video mentah, foto, logo, dll.):</label>
                  <input
                    type="file"
                    id="upload-aset"
                    name="aset_proyek[]"
                    accept="video/mp4, image/jpeg, image/png, .zip, .rar"
                    multiple
                  />
                  <small>Format: MP4, JPG, PNG, ZIP, RAR. Maks. 500MB total.</small>
                </div>
              </fieldset>

              {/* Bagian 3: Metode Pembayaran */}
              <fieldset className="order-fieldset">
                <legend>Metode Pembayaran</legend>

                <div className="order-options">
                  <div className="order-option-item">
                    <input
                      type="radio"
                      id="bayar-bca"
                      name="metode_bayar"
                      value="bca"
                      checked={formData.metode_bayar === 'bca'}
                      onChange={handleChange}
                    />
                    <label htmlFor="bayar-bca">Transfer Bank BCA</label>
                  </div>

                  <div className="order-option-item">
                    <input
                      type="radio"
                      id="bayar-mandiri"
                      name="metode_bayar"
                      value="mandiri"
                      checked={formData.metode_bayar === 'mandiri'}
                      onChange={handleChange}
                    />
                    <label htmlFor="bayar-mandiri">Transfer Bank Mandiri</label>
                  </div>

                  <div className="order-option-item">
                    <input
                      type="radio"
                      id="bayar-gopay"
                      name="metode_bayar"
                      value="gopay"
                      checked={formData.metode_bayar === 'gopay'}
                      onChange={handleChange}
                    />
                    <label htmlFor="bayar-gopay">GoPay</label>
                  </div>

                  <div className="order-option-item">
                    <input
                      type="radio"
                      id="bayar-ovo"
                      name="metode_bayar"
                      value="ovo"
                      checked={formData.metode_bayar === 'ovo'}
                      onChange={handleChange}
                    />
                    <label htmlFor="bayar-ovo">OVO</label>
                  </div>

                  <div className="order-option-item">
                    <input
                      type="radio"
                      id="bayar-dana"
                      name="metode_bayar"
                      value="dana"
                      checked={formData.metode_bayar === 'dana'}
                      onChange={handleChange}
                    />
                    <label htmlFor="bayar-dana">DANA</label>
                  </div>
                </div>
              </fieldset>

              {/* Bagian 4: Konfirmasi */}
              <fieldset className="order-fieldset">
                <legend>Konfirmasi Pesanan</legend>

                <div className="order-check-item">
                  <input
                    type="checkbox"
                    id="setuju-sk-order"
                    name="setuju_sk"
                    value="ya"
                    checked={formData.setuju_sk}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="setuju-sk-order">
                    Saya menyetujui{' '}
                    <Link to="/detail-jasa#syarat">Syarat &amp; Ketentuan</Link>{' '}
                    layanan ini, termasuk kebijakan revisi dan refund *
                  </label>
                </div>

                <div className="order-check-item">
                  <input
                    type="checkbox"
                    id="konfirmasi-data"
                    name="konfirmasi_data"
                    value="ya"
                    checked={formData.konfirmasi_data}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="konfirmasi-data">
                    Saya menyatakan bahwa brief dan aset yang saya unggah adalah milik saya dan tidak melanggar hak cipta pihak lain *
                  </label>
                </div>
              </fieldset>

              <div className="order-actions">
                <p className="order-total-text">
                  <strong>Total yang akan dibayar: {pkg.totalFormatted}</strong>
                </p>
                <button type="submit" className="button button--primary">
                  Konfirmasi &amp; Bayar Sekarang
                </button>
                <Link to="/detail-jasa" className="button button--secondary">
                  Kembali ke Halaman Jasa
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
