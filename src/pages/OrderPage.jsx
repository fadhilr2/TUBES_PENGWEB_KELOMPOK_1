import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function OrderPage() {
  const [packages, setPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState(null);

  const [usdRate, setUsdRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);

  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [formData, setFormData] = useState({
    nama_pemesan: '',
    email_pemesan: '',
    wa_pemesan: '',
    deadline: '',
    brief: '',
    metode_bayar: 'bca',
    setuju_sk: false,
    konfirmasi_data: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const pkg = packages.find((p) => p.id === selectedPackageId) || null;


  useEffect(() => {
    document.title = 'Konfirmasi & Pesan Jasa - SewaSkill';

    Promise.all([
      fetch('/data/packages.json').then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat paket (HTTP ${res.status})`);
        return res.json();
      }),
      fetch('/data/payment-methods.json').then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat metode bayar (HTTP ${res.status})`);
        return res.json();
      }),
    ])
      .then(([pkgData, payData]) => {
        setPackages(pkgData);
        setPaymentMethods(payData);
        if (pkgData.length > 1) setSelectedPackageId(pkgData[1].id);
        if (payData.length > 0)
          setFormData((prev) => ({ ...prev, metode_bayar: payData[0].id }));
      })
      .catch((err) => setPackagesError(err.message))
      .finally(() => setPackagesLoading(false));
  }, []);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/IDR')
      .then((res) => res.json())
      .then((data) => setUsdRate(data?.rates?.USD ?? null))
      .catch(() => setUsdRate(null))
      .finally(() => setRateLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'paket') {
      setSelectedPackageId(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderResult(null);

    const payload = {
      title: `Order SewaSkill - ${pkg?.name ?? 'Paket'}`,
      body: JSON.stringify({
        ...formData,
        paket: selectedPackageId,
        total: pkg?.total ?? 0,
        timestamp: new Date().toISOString(),
      }),
      userId: 1,
    };

    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setOrderResult({ success: true, orderId: data.id });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setOrderResult({ success: false, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toUSD = (idrAmount) => {
    if (!usdRate || !idrAmount) return null;
    return (idrAmount * usdRate).toFixed(2);
  };

  if (packagesLoading) {
    return (
      <main className="py-5">
        <div className="container d-flex align-items-center gap-3 text-muted">
          <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          <span>Memuat data paket dari server…</span>
        </div>
      </main>
    );
  }

  if (packagesError) {
    return (
      <main className="py-5">
        <div className="container">
          <div className="alert alert-danger">
            <strong>Gagal memuat data:</strong> {packagesError}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-5">
      <div className="container">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Beranda</Link></li>
            <li className="breadcrumb-item"><Link to="/katalog">Katalog</Link></li>
            <li className="breadcrumb-item"><Link to="/detail-jasa">Rizky Aditya</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Pesan Jasa</li>
          </ol>
        </nav>

        <h1 className="fw-bold mb-5">Konfirmasi &amp; Pesan Jasa</h1>

        {orderResult?.success && (
          <div className="alert alert-success alert-dismissible mb-4" role="alert">
            <h4 className="alert-heading">Pesanan Berhasil Dibuat! 🎉</h4>
            <p className="mb-1">
              Nomor transaksi: <strong>#{orderResult.orderId}</strong>
            </p>
            <p className="mb-0">
              Instruksi pembayaran dikirim ke <strong>{formData.email_pemesan}</strong> dan WA{' '}
              <strong>{formData.wa_pemesan}</strong>.
            </p>
            <button type="button" className="btn-close" onClick={() => setOrderResult(null)} aria-label="Tutup" />
          </div>
        )}

        {orderResult?.success === false && (
          <div className="alert alert-danger alert-dismissible mb-4" role="alert">
            <strong>Gagal membuat pesanan.</strong> {orderResult.error}
            <button type="button" className="btn-close" onClick={() => setOrderResult(null)} aria-label="Tutup" />
          </div>
        )}

        <div className="row gy-4">
          {/* Kolom Form */}
          <div className="col-lg-8">
            <form id="form-pemesanan" onSubmit={handleSubmit}>

              {/* Data Diri */}
              <fieldset className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Data Diri Pemesan</legend>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="nama-pemesan" className="form-label fw-semibold">Nama Lengkap *</label>
                      <input
                        type="text" id="nama-pemesan" name="nama_pemesan"
                        className="form-control" placeholder="Contoh: Dinda Rahayu"
                        value={formData.nama_pemesan} onChange={handleChange} required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email-pemesan" className="form-label fw-semibold">Alamat Email *</label>
                      <input
                        type="email" id="email-pemesan" name="email_pemesan"
                        className="form-control" placeholder="Contoh: dinda@email.com"
                        value={formData.email_pemesan} onChange={handleChange} required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="wa-pemesan" className="form-label fw-semibold">Nomor WhatsApp *</label>
                      <input
                        type="tel" id="wa-pemesan" name="wa_pemesan"
                        className="form-control" placeholder="Contoh: 08123456789"
                        value={formData.wa_pemesan} onChange={handleChange} required
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Detail Pesanan — data dari (b) Mock API Lokal */}
              <fieldset className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Detail Pesanan</legend>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="pilih-paket" className="form-label fw-semibold">Pilih Paket *</label>
                      <select
                        id="pilih-paket" name="paket" className="form-select"
                        value={selectedPackageId} onChange={handleChange} required
                      >
                        {packages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.priceFormatted} ({p.desc})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="deadline" className="form-label fw-semibold">Tanggal Deadline</label>
                      <input
                        type="date" id="deadline" name="deadline" className="form-control"
                        value={formData.deadline} onChange={handleChange}
                      />
                      <div className="form-text">Opsional. Standar: 2-3 hari kerja.</div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="brief-proyek" className="form-label fw-semibold">Brief Proyek *</label>
                      <textarea
                        id="brief-proyek" name="brief" rows="4" className="form-control"
                        placeholder="Jelaskan detail proyek: tema, gaya editing, referensi, dll."
                        value={formData.brief} onChange={handleChange} required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="upload-aset" className="form-label fw-semibold">Upload Aset Proyek</label>
                      <input
                        type="file" id="upload-aset" name="aset_proyek[]"
                        className="form-control" accept="video/mp4,image/jpeg,image/png,.zip,.rar" multiple
                      />
                      <div className="form-text">Format: MP4, JPG, PNG, ZIP, RAR. Maks. 500MB.</div>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Metode Pembayaran — data dari (b) Mock API Lokal */}
              <fieldset className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Metode Pembayaran</legend>
                  <div className="row g-2">
                    {paymentMethods.map(({ id, label }) => (
                      <div key={id} className="col-sm-4 col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input" type="radio"
                            id={`bayar-${id}`} name="metode_bayar" value={id}
                            checked={formData.metode_bayar === id} onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`bayar-${id}`}>{label}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Konfirmasi */}
              <fieldset className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Konfirmasi Pesanan</legend>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input" type="checkbox"
                      id="setuju-sk-order" name="setuju_sk"
                      checked={formData.setuju_sk} onChange={handleChange} required
                    />
                    <label className="form-check-label" htmlFor="setuju-sk-order">
                      Saya menyetujui <Link to="/detail-jasa#syarat">Syarat &amp; Ketentuan</Link> layanan ini *
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input" type="checkbox"
                      id="konfirmasi-data" name="konfirmasi_data"
                      checked={formData.konfirmasi_data} onChange={handleChange} required
                    />
                    <label className="form-check-label" htmlFor="konfirmasi-data">
                      Saya menyatakan aset yang diunggah adalah milik saya dan tidak melanggar hak cipta *
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* Submit */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <p className="mb-0 fw-semibold">
                  Total:{' '}
                  <span className="text-primary fs-5">{pkg ? pkg.totalFormatted : '—'}</span>
                  {pkg && !rateLoading && toUSD(pkg.total) && (
                    <span className="badge bg-secondary ms-2 fw-normal" title="Kurs via open.er-api.com" style={{ fontSize: '0.75rem' }}>
                      ≈ ${toUSD(pkg.total)} USD
                    </span>
                  )}
                  {rateLoading && (
                    <span className="ms-2 text-muted small">
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      Memuat kurs…
                    </span>
                  )}
                </p>
                <button className="btn btn-primary btn-lg px-4" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Memproses…</>
                  ) : (
                    'Konfirmasi & Bayar Sekarang'
                  )}
                </button>
                <Link to="/detail-jasa" className="btn btn-outline-secondary">Kembali ke Halaman Jasa</Link>
              </div>
            </form>
          </div>

          {/* Kolom Ringkasan */}
          <div className="col-lg-4">
            <aside id="ringkasan-order" className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-4">Ringkasan Pesanan</h2>

                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                    alt="Foto profil Rizky Aditya"
                    className="avatar-sm flex-shrink-0" width="48" height="48"
                  />
                  <div>
                    <p className="mb-0 fw-semibold small">Rizky Aditya</p>
                    <p className="mb-0 text-muted small">Edit Video Pendek — {pkg ? pkg.name : '—'}</p>
                  </div>
                </div>

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
                        <td className="small">
                          Jasa Edit Video — {pkg ? pkg.name : '—'}<br />
                          <span className="text-muted">{pkg ? pkg.desc : ''}</span>
                        </td>
                        <td className="small fw-semibold">{pkg ? pkg.priceFormatted : '—'}</td>
                      </tr>
                      <tr>
                        <td className="small">Biaya Layanan (5%)</td>
                        <td className="small">{pkg ? pkg.feeFormatted : '—'}</td>
                      </tr>
                      <tr>
                        <td className="small">Biaya Admin</td>
                        <td className="small">Rp 0</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="table-primary">
                        <th scope="row" className="small">Total Pembayaran</th>
                        <td className="fw-bold small">{pkg ? pkg.totalFormatted : '—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* (a) PUBLIC API: Info kurs USD dari open.er-api.com */}
                <div className="alert alert-light border py-2 px-3 mb-3 small">
                  <strong>💱 Estimasi dalam USD:</strong>{' '}
                  {rateLoading
                    ? 'Memuat kurs real-time…'
                    : pkg && toUSD(pkg.total)
                      ? `≈ $${toUSD(pkg.total)} USD`
                      : 'Kurs tidak tersedia'}
                  {!rateLoading && usdRate && (
                    <span className="text-muted d-block">
                      Kurs: 1 IDR = {usdRate.toFixed(8)} USD<br />
                      <em>Sumber: open.er-api.com</em>
                    </span>
                  )}
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
