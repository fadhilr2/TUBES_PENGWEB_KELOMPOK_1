import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    <main className="py-5">
      <div className="container">

        {/* ── BREADCRUMB ───────────────────────────────── */}
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Beranda</Link></li>
            <li className="breadcrumb-item"><Link to="/katalog">Katalog</Link></li>
            <li className="breadcrumb-item"><Link to="/detail-jasa">Rizky Aditya</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Pesan Jasa</li>
          </ol>
        </nav>

        <h1 className="fw-bold mb-5">Konfirmasi &amp; Pesan Jasa</h1>

        {/* ── SUCCESS ALERT ────────────────────────────── */}
        {orderPlaced && (
          <div className="alert alert-success alert-dismissible mb-4" role="alert">
            <h4 className="alert-heading">Pesanan Berhasil Dibuat! 🎉</h4>
            <p className="mb-0">
              Instruksi pembayaran telah dikirimkan ke email <strong>{formData.email_pemesan}</strong> dan
              WhatsApp <strong>{formData.wa_pemesan}</strong>. Dana Anda aman bersama sistem Escrow SewaSkill.
            </p>
            <button type="button" className="btn-close" onClick={() => setOrderPlaced(false)} aria-label="Tutup"></button>
          </div>
        )}

        <div className="row gy-4">

          {/* ── LEFT: Form Pemesanan ────────────────────── */}
          <div className="col-lg-8">
            <section id="form-pemesanan">
              <h2 className="h5 fw-semibold mb-4">Isi Data Pemesanan</h2>

              <form onSubmit={handleSubmit}>

                {/* Fieldset 1: Data Diri */}
                <fieldset className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Data Diri Pemesan</legend>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="nama-pemesan" className="form-label fw-semibold">Nama Lengkap *</label>
                        <input
                          type="text"
                          id="nama-pemesan"
                          name="nama_pemesan"
                          className="form-control"
                          value={formData.nama_pemesan}
                          onChange={handleChange}
                          placeholder="Contoh: Dinda Rahayu"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email-pemesan" className="form-label fw-semibold">Alamat Email *</label>
                        <input
                          type="email"
                          id="email-pemesan"
                          name="email_pemesan"
                          className="form-control"
                          value={formData.email_pemesan}
                          onChange={handleChange}
                          placeholder="Contoh: dinda@email.com"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="wa-pemesan" className="form-label fw-semibold">Nomor WhatsApp *</label>
                        <input
                          type="tel"
                          id="wa-pemesan"
                          name="wa_pemesan"
                          className="form-control"
                          value={formData.wa_pemesan}
                          onChange={handleChange}
                          placeholder="Contoh: 08123456789"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Fieldset 2: Detail Pesanan */}
                <fieldset className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Detail Pesanan</legend>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="pilih-paket" className="form-label fw-semibold">Pilih Paket *</label>
                        <select
                          id="pilih-paket"
                          name="paket"
                          className="form-select"
                          value={selectedPackage}
                          onChange={handleChange}
                          required
                        >
                          <option value="basic">Paket Basic — Rp 50.000 (Maks. 30 detik, 1x revisi)</option>
                          <option value="standard">Paket Standard — Rp 100.000 (Maks. 60 detik, 3x revisi)</option>
                          <option value="premium">Paket Premium — Rp 200.000 (Maks. 3 menit, revisi tak terbatas)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="deadline" className="form-label fw-semibold">Tanggal Deadline</label>
                        <input
                          type="date"
                          id="deadline"
                          name="deadline"
                          className="form-control"
                          value={formData.deadline}
                          onChange={handleChange}
                        />
                        <div className="form-text">Opsional. Pengerjaan standar 2–3 hari kerja.</div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="brief-proyek" className="form-label fw-semibold">Brief Proyek / Catatan untuk Talent *</label>
                        <textarea
                          id="brief-proyek"
                          name="brief"
                          rows="4"
                          className="form-control"
                          value={formData.brief}
                          onChange={handleChange}
                          placeholder="Jelaskan detail proyek kamu: tema video, gaya editing yang diinginkan, referensi video sejenis, dll."
                          required
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label htmlFor="upload-aset" className="form-label fw-semibold">Upload Bahan / Aset Proyek</label>
                        <input
                          type="file"
                          id="upload-aset"
                          name="aset_proyek[]"
                          className="form-control"
                          accept="video/mp4, image/jpeg, image/png, .zip, .rar"
                          multiple
                        />
                        <div className="form-text">Format: MP4, JPG, PNG, ZIP, RAR. Maks. 500MB total.</div>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Fieldset 3: Metode Pembayaran */}
                <fieldset className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Metode Pembayaran</legend>
                    <div className="row g-2">
                      {[
                        { val: 'bca', label: 'Transfer Bank BCA' },
                        { val: 'mandiri', label: 'Transfer Bank Mandiri' },
                        { val: 'gopay', label: 'GoPay' },
                        { val: 'ovo', label: 'OVO' },
                        { val: 'dana', label: 'DANA' },
                      ].map(({ val, label }) => (
                        <div key={val} className="col-sm-4 col-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id={`bayar-${val}`}
                              name="metode_bayar"
                              value={val}
                              checked={formData.metode_bayar === val}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor={`bayar-${val}`}>{label}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </fieldset>

                {/* Fieldset 4: Konfirmasi */}
                <fieldset className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Konfirmasi Pesanan</legend>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="setuju-sk-order"
                        name="setuju_sk"
                        checked={formData.setuju_sk}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="setuju-sk-order">
                        Saya menyetujui{' '}
                        <Link to="/detail-jasa#syarat">Syarat &amp; Ketentuan</Link>{' '}
                        layanan ini, termasuk kebijakan revisi dan refund *
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="konfirmasi-data"
                        name="konfirmasi_data"
                        checked={formData.konfirmasi_data}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="konfirmasi-data">
                        Saya menyatakan bahwa brief dan aset yang saya unggah adalah milik saya dan tidak melanggar hak cipta pihak lain *
                      </label>
                    </div>
                  </div>
                </fieldset>

                {/* Submit */}
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <p className="mb-0 fw-semibold">Total: <span className="text-primary fs-5">{pkg.totalFormatted}</span></p>
                  <button className="btn btn-primary btn-lg px-4" type="submit">
                    Konfirmasi &amp; Bayar Sekarang
                  </button>
                  <Link to="/detail-jasa" className="btn btn-outline-secondary">
                    Kembali ke Halaman Jasa
                  </Link>
                </div>
              </form>
            </section>
          </div>

          {/* ── RIGHT: Ringkasan Pesanan ─────────────────── */}
          <div className="col-lg-4">
            <aside id="ringkasan-order" className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-4">Ringkasan Pesanan</h2>

                {/* Talent info */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                    alt="Foto profil Rizky Aditya"
                    className="avatar-sm flex-shrink-0"
                    width="48"
                    height="48"
                  />
                  <div>
                    <p className="mb-0 fw-semibold small">Rizky Aditya</p>
                    <p className="mb-0 text-muted small">Edit Video Pendek — {pkg.name}</p>
                  </div>
                </div>

                {/* Price table */}
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered">
                    <caption className="visually-hidden">Rincian biaya pesanan</caption>
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="small">Jasa Edit Video — {pkg.name}<br /><span className="text-muted">{pkg.desc}</span></td>
                        <td className="small fw-semibold">{pkg.priceFormatted}</td>
                      </tr>
                      <tr>
                        <td className="small">Biaya Layanan (5%)</td>
                        <td className="small">{pkg.feeFormatted}</td>
                      </tr>
                      <tr>
                        <td className="small">Biaya Admin</td>
                        <td className="small">Rp 0</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="table-primary">
                        <th scope="row" className="small">Total Pembayaran</th>
                        <td className="fw-bold small">{pkg.totalFormatted}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="text-muted small mb-0">
                  ⏱ <strong>Estimasi Selesai:</strong> 2 hari kerja setelah aset diterima
                </p>
              </div>
            </aside>
          </div>

        </div>
      </div>
    </main>
  );
}
