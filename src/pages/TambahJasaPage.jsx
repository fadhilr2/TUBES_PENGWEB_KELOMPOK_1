import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './TambahJasaPage.css';

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
    <main className="page-add-service">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link to="/">Beranda</Link>
            </li>
            <li className="breadcrumb__item" aria-current="page">
              Daftarkan Jasamu
            </li>
          </ol>
        </nav>

        <div className="page-add-service__intro">
          <p className="eyebrow">Jalur Talent &amp; Penjual</p>
          <h1>Daftarkan Jasa &amp; Keahlianmu</h1>
          <p className="page-add-service__lead">
            Bergabunglah dengan ratusan talent profesional di SewaSkill.
            Isi formulir berikut dengan lengkap dan jujur agar profilmu
            mudah ditemukan oleh klien yang tepat.
          </p>
        </div>

        {submitted && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              color: '#065f46'
            }}
          >
            <strong>Pendaftaran Berhasil Terkirim!</strong> Tim SewaSkill akan meninjau pengajuan profil jasa Anda dalam 1x24 jam.
          </div>
        )}

        <div className="form-card">
          <form onSubmit={handleSubmit} onReset={handleReset}>
            <fieldset>
              <legend>Data Pribadi Talent</legend>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nama-lengkap">
                    Nama Lengkap <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id="nama-lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Contoh: Rizky Aditya Pratama"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    Alamat Email <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Contoh: rizky@email.com"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="no-whatsapp">
                    Nomor WhatsApp <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="tel"
                    id="no-whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="link-portofolio">Link Portofolio / Media Sosial</label>
                  <input
                    type="url"
                    id="link-portofolio"
                    name="link_porto"
                    value={formData.link_porto}
                    onChange={handleChange}
                    placeholder="Contoh: https://instagram.com/rizkydesign"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="foto-profil">
                  Foto Profil (JPG/PNG, maks. 2MB) <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <input
                  type="file"
                  id="foto-profil"
                  name="foto_profil"
                  accept="image/jpeg, image/png"
                  required
                  aria-required="true"
                />
                <small className="field-help">Format yang diterima: JPG, PNG. Ukuran maks. 2MB.</small>
              </div>
            </fieldset>

            <fieldset>
              <legend>Detail Jasa yang Ditawarkan</legend>

              <div className="form-group">
                <label htmlFor="kategori-skill">
                  Kategori Skill Utama <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <select
                  id="kategori-skill"
                  name="kategori"
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

              <div className="form-group">
                <label htmlFor="judul-jasa">
                  Judul Jasa <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="judul-jasa"
                  name="judul_jasa"
                  value={formData.judul_jasa}
                  onChange={handleChange}
                  placeholder="Contoh: Jasa Edit Video Reels Instagram Profesional"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="harga-dasar">
                    Harga Dasar (Rp) <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="number"
                    id="harga-dasar"
                    name="harga"
                    min="10000"
                    step="5000"
                    value={formData.harga}
                    onChange={handleChange}
                    placeholder="Contoh: 50000"
                    required
                    aria-required="true"
                  />
                  <small className="field-help">Harga minimum Rp 10.000</small>
                </div>
                <div className="form-group">
                  <label htmlFor="waktu-pengerjaan">
                    Estimasi Waktu Pengerjaan (hari) <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="number"
                    id="waktu-pengerjaan"
                    name="waktu_kerja"
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

              <div className="form-group">
                <label htmlFor="deskripsi-jasa">
                  Deskripsi Jasa &amp; Pengalaman <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="deskripsi-jasa"
                  name="deskripsi"
                  rows="6"
                  cols="50"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Ceritakan pengalamanmu, hasil kerja yang pernah dibuat, tools yang dikuasai, dan apa yang membuat jasamu spesial..."
                  required
                  aria-required="true"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="sampel-karya">Upload Sampel Karya (maks. 5 file, JPG/PNG/MP4)</label>
                <input
                  type="file"
                  id="sampel-karya"
                  name="sampel_karya[]"
                  accept="image/jpeg, image/png, video/mp4"
                  multiple
                />
                <small className="field-help">Format yang diterima: JPG, PNG, MP4. Ukuran maks. 10MB per file.</small>
              </div>
            </fieldset>

            <fieldset>
              <legend>Status Ketersediaan Saat Ini</legend>

              <div className="form-group radio-group">
                <input
                  type="radio"
                  id="status-tersedia"
                  name="status"
                  value="tersedia"
                  checked={formData.status === 'tersedia'}
                  onChange={handleChange}
                />
                <label htmlFor="status-tersedia">Tersedia (Siap menerima order baru)</label>
              </div>
              <div className="form-group radio-group">
                <input
                  type="radio"
                  id="status-sibuk"
                  name="status"
                  value="sibuk"
                  checked={formData.status === 'sibuk'}
                  onChange={handleChange}
                />
                <label htmlFor="status-sibuk">Sedang Sibuk (Tidak menerima order dulu)</label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Persetujuan &amp; Ketentuan</legend>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="setuju-sk"
                  name="setuju_sk"
                  value="ya"
                  checked={formData.setuju_sk}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
                <label htmlFor="setuju-sk">
                  Saya menyetujui{' '}
                  <a href="#syarat-ketentuan">Syarat &amp; Ketentuan</a>{' '}
                  platform SewaSkill <span className="required-mark" aria-hidden="true">*</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="setuju-data"
                  name="setuju_data"
                  value="ya"
                  checked={formData.setuju_data}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
                <label htmlFor="setuju-data">
                  Saya menyatakan bahwa data dan sampel karya yang diunggah adalah milik saya sendiri{' '}
                  <span className="required-mark" aria-hidden="true">*</span>
                </label>
              </div>
            </fieldset>

            <div className="form-actions">
              <button className="button button--primary" type="submit">
                Daftarkan Jasa Saya
              </button>
              <button className="button button--secondary" type="reset">
                Bersihkan Form
              </button>
            </div>
          </form>

          <p className="page-add-service__catalog-link">
            Sudah pernah mendaftarkan jasa? <Link to="/katalog">Lihat Katalog Talent</Link>
          </p>
        </div>
      </div>

      <section id="syarat-ketentuan" className="page-add-service__terms">
        <div className="container">
          <h2>Syarat &amp; Ketentuan Platform SewaSkill</h2>
          <ol>
            <li>Talent wajib memberikan informasi yang jujur dan akurat.</li>
            <li>Sampel karya yang diunggah harus merupakan hasil karya sendiri.</li>
            <li>SewaSkill berhak menangguhkan akun yang terbukti melanggar ketentuan.</li>
            <li>Pembayaran dilakukan melalui sistem escrow platform setelah order dikonfirmasi.</li>
            <li>Revisi maksimal sesuai paket yang dipilih oleh klien.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
