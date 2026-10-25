import { useEffect, useState } from 'react';

export default function TambahJasaPage() {
  const [formData, setFormData] = useState({
    nama_lengkap: '', email: '', whatsapp: '', link_porto: '',
    judul_jasa: '', harga: '', waktu_kerja: '', deskripsi: '',
    setuju_sk: false, setuju_data: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Daftarkan Jasamu - SewaSkill Platform Jasa Freelance Mikro';

    fetch('/data/dataJasa.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data`);
        return res.json();
      })
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          ...data.userData,
          ...data.jasaData
        }));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="py-5">
      <div className="container">
        <div className="mb-4">
          <h1 className="fw-bold display-6 mb-2">Daftarkan Jasa &amp; Keahlianmu</h1>
        </div>

        {loading && <div className="alert alert-info py-2 mb-3">Memuat data template jasa...</div>}
        {error && <div className="alert alert-warning py-2 mb-3">{error}</div>}

        {submitted && (
          <div className="alert alert-success alert-dismissible" role="alert">
            <strong>Pendaftaran Berhasil Terkirim!</strong> Tim SewaSkill akan meninjau pengajuan profil jasa Anda dalam 1x24 jam.
            <button type="button" className="btn-close" onClick={() => setSubmitted(false)} aria-label="Tutup" />
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              {/* ── Data Pribadi ── */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Data Pribadi Talent</legend>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="nama-lengkap" className="form-label fw-semibold">
                      Nama Lengkap <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text" id="nama-lengkap" name="nama_lengkap"
                      className="form-control"
                      value={formData.nama_lengkap} onChange={handleChange}
                      placeholder="Contoh: Rizky Aditya Pratama"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Alamat Email <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email" id="email" name="email"
                      className="form-control"
                      value={formData.email} onChange={handleChange}
                      placeholder="Contoh: rizky@email.com"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="no-whatsapp" className="form-label fw-semibold">
                      Nomor WhatsApp <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="tel" id="no-whatsapp" name="whatsapp"
                      className="form-control"
                      value={formData.whatsapp} onChange={handleChange}
                      placeholder="Contoh: 08123456789"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="link-portofolio" className="form-label fw-semibold">Link Portofolio / Media Sosial</label>
                    <input
                      type="url" id="link-portofolio" name="link_porto"
                      className="form-control"
                      value={formData.link_porto} onChange={handleChange}
                      placeholder="Contoh: https://instagram.com/rizkydesign"
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── Detail Jasa ── */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Detail Jasa yang Ditawarkan</legend>
                <div className="mb-3">
                  <label htmlFor="judul-jasa" className="form-label fw-semibold">
                    Judul Jasa <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text" id="judul-jasa" name="judul_jasa"
                    className="form-control"
                    value={formData.judul_jasa} onChange={handleChange}
                    placeholder="Contoh: Jasa Edit Video Reels Instagram Profesional"
                    required
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="harga-dasar" className="form-label fw-semibold">
                      Harga Dasar (Rp) <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number" id="harga-dasar" name="harga"
                      className="form-control"
                      min="10000" step="5000"
                      value={formData.harga} onChange={handleChange}
                      placeholder="Harga minimum Rp 10.000"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="waktu-pengerjaan" className="form-label fw-semibold">
                      Estimasi Waktu Pengerjaan (hari) <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number" id="waktu-pengerjaan" name="waktu_kerja"
                      className="form-control"
                      min="1" max="30"
                      value={formData.waktu_kerja} onChange={handleChange}
                      placeholder="Contoh: 3"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="deskripsi-jasa" className="form-label fw-semibold">
                    Deskripsi Jasa &amp; Pengalaman <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="deskripsi-jasa" name="deskripsi" rows="5"
                    className="form-control"
                    value={formData.deskripsi} onChange={handleChange}
                    placeholder="Ceritakan pengalamanmu, hasil kerja yang pernah dibuat, tools yang dikuasai..."
                    required
                  />
                </div>
              </fieldset>

              {/* ── Persetujuan ── */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Persetujuan &amp; Ketentuan</legend>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox" id="setuju-sk" name="setuju_sk"
                    checked={formData.setuju_sk} onChange={handleChange}
                    required
                  />
                  <label className="form-check-label" htmlFor="setuju-sk">
                    Saya menyetujui Syarat &amp; Ketentuan platform SewaSkill <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox" id="setuju-data" name="setuju_data"
                    checked={formData.setuju_data} onChange={handleChange}
                    required
                  />
                  <label className="form-check-label" htmlFor="setuju-data">
                    Saya menyatakan bahwa data dan karya yang diunggah adalah milik saya sendiri{' '}
                    <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                </div>
              </fieldset>

              <button className="btn btn-primary px-4" type="submit">Daftarkan Jasa Saya</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}