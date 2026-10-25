import { useEffect, useState } from 'react';

export default function OrderPage() {
  const [packages, setPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [formData, setFormData] = useState({
    nama_pemesan: '',
    email_pemesan: '',
    wa_pemesan: '',
    deadline: '',
    brief: '',
    metode_bayar: 'bca',
  });
  const [orderResult, setOrderResult] = useState(null);


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
      .catch(() => { });
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
    }
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);


  return (
    <main className="py-5">
      <div className="container">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Beranda</a></li>
            <li className="breadcrumb-item"><a href="/katalog">Katalog</a></li>
            <li className="breadcrumb-item"><a href="/detail-jasa">Rizky Aditya</a></li>
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
          <div className="col-lg-8">
            <form id="form-pemesanan" onSubmit={handleSubmit}>

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
                            {p.name} — {formatRupiah(p.price)} ({p.desc})
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


              <div className="d-flex flex-wrap gap-3 align-items-center">
                <button className="btn btn-primary btn-lg px-4" type="submit">
                  Konfirmasi &amp; Bayar Sekarang
                </button>
                <a href="/detail-jasa" className="btn btn-outline-secondary">Kembali ke Halaman Jasa</a>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
