import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function TambahJasaPage() {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    whatsapp: '',
    link_porto: '',
    kategori: '',
    judul_jasa: '',
    harga: '',
    waktu_kerja: '',
    deskripsi: '',
    status: 'tersedia',
    setuju_sk: false,
    setuju_data: false
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Daftarkan Jasamu — SewaSkill Platform Jasa Freelance Mikro';
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFormData({
      nama_lengkap: '',
      email: '',
      whatsapp: '',
      link_porto: '',
      kategori: '',
      judul_jasa: '',
      harga: '',
      waktu_kerja: '',
      deskripsi: '',
      status: 'tersedia',
      setuju_sk: false,
      setuju_data: false
    });
    setSubmitted(false);
  };

  return (
    <main className="py-5">
      <div className="container">

        {/* ── BREADCRUMB ───────────────────────────────── */}
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Beranda</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Daftarkan Jasamu</li>
          </ol>
        </nav>

        {/* ── PAGE INTRO ───────────────────────────────── */}
        <div className="mb-5">
          <p className="text-primary fw-semibold text-uppercase small" style={{ letterSpacing: '.08em' }}>Jalur Talent &amp; Penjual</p>
          <h1 className="fw-bold display-6 mb-2">Daftarkan Jasa &amp; Keahlianmu</h1>
          <p className="text-muted">
            Bergabunglah dengan ratusan talent profesional di SewaSkill.
            Isi formulir berikut dengan lengkap dan jujur agar profilmu mudah ditemukan oleh klien yang tepat.
          </p>
        </div>

        {/* ── SUCCESS ALERT ────────────────────────────── */}
        {submitted && (
          <div className="alert alert-success alert-dismissible" role="alert">
            <strong>Pendaftaran Berhasil Terkirim!</strong> Tim SewaSkill akan meninjau pengajuan profil jasa Anda dalam 1x24 jam.
            <button type="button" className="btn-close" onClick={() => setSubmitted(false)} aria-label="Tutup"></button>
          </div>
        )}

        {/* ── FORM CARD ────────────────────────────────── */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit} onReset={handleReset}>

              {/* Fieldset 1: Data Pribadi */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Data Pribadi Talent</legend>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="nama-lengkap" className="form-label fw-semibold">
                      Nama Lengkap <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="nama-lengkap"
                      name="nama_lengkap"
                      className="form-control"
                      value={formData.nama_lengkap}
                      onChange={handleChange}
                      placeholder="Contoh: Rizky Aditya Pratama"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Alamat Email <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Contoh: rizky@email.com"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="no-whatsapp" className="form-label fw-semibold">
                      Nomor WhatsApp <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="tel"
                      id="no-whatsapp"
                      name="whatsapp"
                      className="form-control"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="Contoh: 08123456789"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="link-portofolio" className="form-label fw-semibold">Link Portofolio / Media Sosial</label>
                    <input
                      type="url"
                      id="link-portofolio"
                      name="link_porto"
                      className="form-control"
                      value={formData.link_porto}
                      onChange={handleChange}
                      placeholder="Contoh: https://instagram.com/rizkydesign"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="foto-profil" className="form-label fw-semibold">
                    Foto Profil (JPG/PNG, maks. 2MB) <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="file"
                    id="foto-profil"
                    name="foto_profil"
                    className="form-control"
                    accept="image/jpeg, image/png"
                    required
                    aria-required="true"
                  />
                  <div className="form-text">Format yang diterima: JPG, PNG. Ukuran maks. 2MB.</div>
                </div>
              </fieldset>

              {/* Fieldset 2: Detail Jasa */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Detail Jasa yang Ditawarkan</legend>

                <div className="mb-3">
                  <label htmlFor="kategori-skill" className="form-label fw-semibold">
                    Kategori Skill Utama <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="kategori-skill"
                    name="kategori"
                    className="form-select"
                    value={formData.kategori}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="video">Edit Video Pendek (Reels/TikTok/Shorts)</option>
                    <option value="thumbnail">Desain Thumbnail YouTube</option>
                    <option value="logo">Desain Logo &amp; Branding</option>
                    <option value="koding">Tutor / Joki Koding (HTML, CSS, JS, Python)</option>
                    <option value="konten">Penulisan Konten &amp; Copywriting</option>
                    <option value="foto">Editing Foto &amp; Retouching</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="judul-jasa" className="form-label fw-semibold">
                    Judul Jasa <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="judul-jasa"
                    name="judul_jasa"
                    className="form-control"
                    value={formData.judul_jasa}
                    onChange={handleChange}
                    placeholder="Contoh: Jasa Edit Video Reels Instagram Profesional"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="harga-dasar" className="form-label fw-semibold">
                      Harga Dasar (Rp) <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="harga-dasar"
                      name="harga"
                      className="form-control"
                      min="10000"
                      step="5000"
                      value={formData.harga}
                      onChange={handleChange}
                      placeholder="Contoh: 50000"
                      required
                      aria-required="true"
                    />
                    <div className="form-text">Harga minimum Rp 10.000</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="waktu-pengerjaan" className="form-label fw-semibold">
                      Estimasi Waktu Pengerjaan (hari) <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="waktu-pengerjaan"
                      name="waktu_kerja"
                      className="form-control"
                      min="1"
                      max="30"
                      value={formData.waktu_kerja}
                      onChange={handleChange}
                      placeholder="Contoh: 3"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="deskripsi-jasa" className="form-label fw-semibold">
                    Deskripsi Jasa &amp; Pengalaman <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="deskripsi-jasa"
                    name="deskripsi"
                    rows="5"
                    className="form-control"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    placeholder="Ceritakan pengalamanmu, hasil kerja yang pernah dibuat, tools yang dikuasai..."
                    required
                    aria-required="true"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="sampel-karya" className="form-label fw-semibold">Upload Sampel Karya (maks. 5 file, JPG/PNG/MP4)</label>
                  <input
                    type="file"
                    id="sampel-karya"
                    name="sampel_karya[]"
                    className="form-control"
                    accept="image/jpeg, image/png, video/mp4"
                    multiple
                  />
                  <div className="form-text">Format yang diterima: JPG, PNG, MP4. Ukuran maks. 10MB per file.</div>
                </div>
              </fieldset>

              {/* Fieldset 3: Status */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Status Ketersediaan Saat Ini</legend>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="status-tersedia"
                    name="status"
                    value="tersedia"
                    checked={formData.status === 'tersedia'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="status-tersedia">Tersedia (Siap menerima order baru)</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="status-sibuk"
                    name="status"
                    value="sibuk"
                    checked={formData.status === 'sibuk'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="status-sibuk">Sedang Sibuk (Tidak menerima order dulu)</label>
                </div>
              </fieldset>

              {/* Fieldset 4: Persetujuan */}
              <fieldset className="mb-4">
                <legend className="h6 fw-semibold border-bottom pb-2 mb-4">Persetujuan &amp; Ketentuan</legend>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="setuju-sk"
                    name="setuju_sk"
                    checked={formData.setuju_sk}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                  <label className="form-check-label" htmlFor="setuju-sk">
                    Saya menyetujui{' '}
                    <a href="#syarat-ketentuan">Syarat &amp; Ketentuan</a>{' '}
                    platform SewaSkill <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="setuju-data"
                    name="setuju_data"
                    checked={formData.setuju_data}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                  <label className="form-check-label" htmlFor="setuju-data">
                    Saya menyatakan bahwa data dan sampel karya yang diunggah adalah milik saya sendiri{' '}
                    <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                </div>
              </fieldset>

              {/* Actions */}
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary px-4" type="submit">Daftarkan Jasa Saya</button>
                <button className="btn btn-outline-secondary" type="reset">Bersihkan Form</button>
              </div>
            </form>

            <p className="text-muted small mt-4 mb-0">
              Sudah pernah mendaftarkan jasa? <Link to="/katalog">Lihat Katalog Talent</Link>
            </p>
          </div>
        </div>

        {/* ── SYARAT & KETENTUAN ───────────────────────── */}
        <section id="syarat-ketentuan" className="mt-5">
          <div className="card border-0 bg-light">
            <div className="card-body p-4">
              <h2 className="h5 fw-semibold mb-3">Syarat &amp; Ketentuan Platform SewaSkill</h2>
              <ol className="text-muted mb-0">
                <li className="mb-1">Talent wajib memberikan informasi yang jujur dan akurat.</li>
                <li className="mb-1">Sampel karya yang diunggah harus merupakan hasil karya sendiri.</li>
                <li className="mb-1">SewaSkill berhak menangguhkan akun yang terbukti melanggar ketentuan.</li>
                <li className="mb-1">Pembayaran dilakukan melalui sistem escrow platform setelah order dikonfirmasi.</li>
                <li>Revisi maksimal sesuai paket yang dipilih oleh klien.</li>
              </ol>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
