import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState, Notice, PageHeading } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { categoryImages, categoryLabels, money } from '../state/format';

function newPackage() {
  return { id: `package-${crypto.randomUUID()}`, name: '', description: '', price: '' };
}

function buildInitialForm(service) {
  if (!service) {
    return {
      title: '',
      category: 'desain',
      description: '',
      days: 3,
      portfolioUrl: '',
    };
  }
  return {
    title: service.title || '',
    category: service.category || 'desain',
    description: service.description || '',
    days: service.days || 3,
    portfolioUrl: service.portfolioUrl || '',
  };
}

function buildInitialPackages(service) {
  if (!service || !service.packages) {
    return [newPackage()];
  }
  return service.packages.map(function copyPackage(pkg) {
    return Object.assign({}, pkg);
  });
}

function hasDuplicateNames(packages) {
  const seen = [];
  for (let i = 0; i < packages.length; i += 1) {
    const name = packages[i].name.trim().toLowerCase();
    if (seen.includes(name)) {
      return true;
    }
    seen.push(name);
  }
  return false;
}

function CategoryOptions() {
  const entries = Object.entries(categoryLabels);
  return entries.map(function renderOption(entry) {
    const value = entry[0];
    const label = entry[1];
    return (
      <option key={value} value={value}>
        {label}
      </option>
    );
  });
}

function DetailSection({ form, user, onChange }) {
  const userLocation = user.location || '';

  return (
    <section className="panel">
      <p className="eyebrow dark-eyebrow">01 / DETAIL LAYANAN</p>
      <h2>
        Ceritakan <em>keahlianmu.</em>
      </h2>
      <div className="mt-4">
        <div className="row g-4">
          <div className="field col-12">
            <label htmlFor="service-title">Judul jasa</label>
            <input
              id="service-title"
              name="title"
              value={form.title}
              onChange={onChange}
              minLength="3"
              maxLength="140"
              placeholder="Contoh: Desain logo untuk usaha lokal"
              required
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor="service-category">Kategori keahlian</label>
            <select
              id="service-category"
              name="category"
              value={form.category}
              onChange={onChange}
              required
            >
              <CategoryOptions />
            </select>
          </div>
          <div className="field col-md-6">
            <label htmlFor="service-days">Estimasi pengerjaan (hari)</label>
            <input
              id="service-days"
              name="days"
              type="number"
              min="1"
              max="365"
              step="1"
              value={form.days}
              onChange={onChange}
              required
            />
          </div>
          <div className="field col-12">
            <label htmlFor="service-description">Deskripsi jasa &amp; pengalaman</label>
            <textarea
              id="service-description"
              name="description"
              rows="6"
              value={form.description}
              onChange={onChange}
              minLength="10"
              maxLength="5000"
              placeholder="Jelaskan layanan, proses kerja, pengalaman, dan hasil yang akan diterima pemesan."
              required
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor="service-location">Lokasi penyedia</label>
            <input id="service-location" value={userLocation} disabled />
            <small>
              Mengikuti lokasi pada <Link to="/profil">profilmu</Link>.
            </small>
          </div>
          <div className="field col-md-6">
            <label htmlFor="service-portfolio">Link portofolio (opsional)</label>
            <input
              id="service-portfolio"
              name="portfolioUrl"
              type="url"
              value={form.portfolioUrl}
              onChange={onChange}
              placeholder="https://portofolio.example.com"
              maxLength="1000"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PackageEditor({ pkg, index, canRemove, onUpdate, onRemove }) {
  function handleNameChange(event) {
    onUpdate(pkg.id, 'name', event.target.value);
  }

  function handlePriceChange(event) {
    onUpdate(pkg.id, 'price', event.target.value);
  }

  function handleDescriptionChange(event) {
    onUpdate(pkg.id, 'description', event.target.value);
  }

  function handleRemove() {
    onRemove(pkg.id);
  }

  return (
    <fieldset className="package-editor">
      <legend>Paket {index + 1}</legend>
      <div className="mt-4">
        <div className="row g-4">
          <div className="field col-md-6">
            <label htmlFor={`package-name-${index}`}>Nama paket</label>
            <input
              id={`package-name-${index}`}
              value={pkg.name}
              onChange={handleNameChange}
              placeholder="Contoh: Logo Starter"
              maxLength="80"
              required
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor={`package-price-${index}`}>Harga paket (Rp)</label>
            <input
              id={`package-price-${index}`}
              type="number"
              value={pkg.price}
              onChange={handlePriceChange}
              min="1"
              max="1000000000"
              step="1"
              placeholder="Contoh: 75000"
              required
            />
          </div>
          <div className="field col-12">
            <label htmlFor={`package-description-${index}`}>Rincian paket</label>
            <textarea
              id={`package-description-${index}`}
              value={pkg.description}
              onChange={handleDescriptionChange}
              rows="3"
              maxLength="1500"
              placeholder="Contoh: 2 konsep logo, 2 kali revisi, file PNG dan SVG."
            />
          </div>
          <div className="col-12 d-flex flex-wrap align-items-center gap-3">
            <button
              className="button button-danger"
              type="button"
              disabled={!canRemove}
              onClick={handleRemove}
              aria-label={`Hapus paket ${index + 1}`}
            >
              Hapus paket
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function PackageSection({ packages, onUpdate, onRemove, onAdd }) {
  const editors = packages.map(function renderEditor(pkg, index) {
    return (
      <PackageEditor
        key={pkg.id}
        pkg={pkg}
        index={index}
        canRemove={packages.length > 1}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    );
  });

  return (
    <section className="panel">
      <p className="eyebrow dark-eyebrow">02 / PAKET LAYANAN</p>
      <h2>
        Nama bebas.
        <br />
        <em>Nilainya jelas.</em>
      </h2>
      <p>
        Tambahkan setidaknya satu paket. Setiap paket memiliki nama unik, harga, dan rincian
        hasilnya sendiri.
      </p>
      <div className="package-editor-list">{editors}</div>
      <button className="button button-outline" type="button" onClick={onAdd}>
        Tambah paket <span aria-hidden="true">+</span>
      </button>
    </section>
  );
}

function AgreementSection({ agreed, isEditing, onAgreedChange }) {
  let submitLabel = 'Terbitkan jasa saya';
  if (isEditing) {
    submitLabel = 'Simpan perubahan jasa';
  }

  return (
    <section className="panel">
      <label className="check-field" htmlFor="service-agreement">
        <input
          id="service-agreement"
          type="checkbox"
          checked={agreed}
          onChange={onAgreedChange}
          required
        />
        <span>
          Saya menyatakan informasi jasa dan portofolio yang dicantumkan benar serta berhak saya
          gunakan.
        </span>
      </label>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <button className="button button-blue" type="submit">
          {submitLabel} <span aria-hidden="true">↗</span>
        </button>
        <Link className="button button-outline" to="/jasa-saya">
          Batal
        </Link>
      </div>
    </section>
  );
}

function PreviewPanel({ form, packages, user }) {
  const categoryLabel = categoryLabels[form.category];

  let previewTitle = 'Judul jasa kamu';
  if (form.title) {
    previewTitle = form.title;
  }

  let previewDays = '-';
  if (form.days) {
    previewDays = form.days;
  }

  const lines = packages.map(function renderLine(pkg, index) {
    let label = `Paket ${index + 1}`;
    if (pkg.name) {
      label = pkg.name;
    }
    return (
      <div className="summary-line" key={pkg.id}>
        <span>{label}</span>
        <strong>{money(pkg.price || 0)}</strong>
      </div>
    );
  });

  return (
    <aside className="panel sticky-summary">
      <p className="eyebrow dark-eyebrow">PRATINJAU LAYANAN</p>
      <img
        className="detail-cover"
        src={categoryImages[form.category]}
        alt={`Ilustrasi kategori ${categoryLabel}`}
        width="640"
        height="426"
      />
      <h2>{previewTitle}</h2>
      <p>
        {categoryLabel} · {user.location}
      </p>
      <dl className="summary-details">
        <div>
          <dt>Penyedia</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt>Jumlah paket</dt>
          <dd>{packages.length} pilihan</dd>
        </div>
        <div>
          <dt>Estimasi</dt>
          <dd>{previewDays} hari kerja</dd>
        </div>
      </dl>
      <div className="package-preview-list">{lines}</div>
      <p className="demo-note">
        Gambar kategori merupakan ilustrasi. Jasa, paket, dan perubahan profil disimpan di browser
        untuk demo.
      </p>
    </aside>
  );
}

function ServiceEditor({ service, user, saveService }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(function readInitialForm() {
    return buildInitialForm(service);
  });
  const [packages, setPackages] = useState(function readInitialPackages() {
    return buildInitialPackages(service);
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  function handleFieldChange(event) {
    const nextForm = Object.assign({}, form);
    nextForm[event.target.name] = event.target.value;
    setForm(nextForm);
  }

  function handlePackageUpdate(id, key, value) {
    setPackages(function updateList(current) {
      return current.map(function updateOne(pkg) {
        if (pkg.id !== id) {
          return pkg;
        }
        const changed = Object.assign({}, pkg);
        changed[key] = value;
        return changed;
      });
    });
  }

  function handlePackageRemove(id) {
    setPackages(function removeFromList(current) {
      return current.filter(function keepOthers(pkg) {
        return pkg.id !== id;
      });
    });
  }

  function handlePackageAdd() {
    setPackages(function addToList(current) {
      return current.concat([newPackage()]);
    });
  }

  function handleAgreedChange(event) {
    setAgreed(event.target.checked);
  }

  function buildPayload() {
    const payload = Object.assign({}, form);
    if (service) {
      payload.id = service.id;
    }
    payload.days = Number(form.days);
    payload.packages = packages.map(function convertPrice(pkg) {
      const converted = Object.assign({}, pkg);
      converted.price = Number(pkg.price);
      return converted;
    });
    payload.image = categoryImages[form.category];
    return payload;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!agreed) {
      setError('Setujui pernyataan kepemilikan informasi dan karya.');
      return;
    }
    if (hasDuplicateNames(packages)) {
      setError('Setiap paket harus memiliki nama yang berbeda.');
      return;
    }
    try {
      const result = saveService(buildPayload());
      let notice = 'Jasa berhasil ditambahkan dan tersedia di katalog.';
      if (service) {
        notice = 'Jasa berhasil diperbarui.';
      }
      navigate(`/detail-jasa/${result.id}`, { state: { notice: notice } });
    } catch (cause) {
      setError(cause.message);
    }
  }

  let errorBox = null;
  if (error) {
    errorBox = <Notice type="error">{error}</Notice>;
  }

  return (
    <div>
      <div className="row gx-lg-5 gy-4">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {errorBox}
            <DetailSection form={form} user={user} onChange={handleFieldChange} />
            <PackageSection
              packages={packages}
              onUpdate={handlePackageUpdate}
              onRemove={handlePackageRemove}
              onAdd={handlePackageAdd}
            />
            <AgreementSection
              agreed={agreed}
              isEditing={Boolean(service)}
              onAgreedChange={handleAgreedChange}
            />
          </form>
        </div>
        <div className="col-lg-4">
          <PreviewPanel form={form} packages={packages} user={user} />
        </div>
      </div>
    </div>
  );
}

function LoginRequired({ serviceId }) {
  let returnPath = '/tambah-jasa';
  if (serviceId) {
    returnPath = `/edit-jasa/${serviceId}`;
  }
  return (
    <EmptyState
      title="Masuk untuk melanjutkan"
      description="Gunakan akun penyedia untuk menawarkan keahlianmu."
    >
      <Link className="button button-blue" to="/login" state={{ from: returnPath }}>
        Masuk sekarang
      </Link>
    </EmptyState>
  );
}

function ProviderRequired() {
  return (
    <EmptyState
      title="Jadilah penyedia terlebih dahulu"
      description="Lengkapi pendaftaran penyedia melalui profil untuk membuka fitur tambah jasa."
    >
      <Link className="button button-blue" to="/profil">
        Daftar menjadi penyedia <span aria-hidden="true">↗</span>
      </Link>
    </EmptyState>
  );
}

function CannotEdit() {
  return (
    <EmptyState
      title="Jasa tidak dapat diedit"
      description="Hanya pemilik jasa yang dapat memperbarui rincian dan paketnya."
    >
      <Link className="button button-blue" to="/jasa-saya">
        Kembali ke jasa saya
      </Link>
    </EmptyState>
  );
}

function PageTitle({ isEditing }) {
  if (isEditing) {
    return (
      <>
        Perbarui detail.
        <br />
        <em>Jaga kualitasnya.</em>
      </>
    );
  }
  return (
    <>
      Skill kamu.
      <br />
      <em>Karya berikutnya.</em>
    </>
  );
}

export default function TambahJasaPage() {
  const { serviceId } = useParams();
  const { state, user, saveService } = useDemo();

  let service;
  for (let i = 0; i < state.services.length; i += 1) {
    if (state.services[i].id === serviceId) {
      service = state.services[i];
    }
  }

  useEffect(
    function updateTitle() {
      let label = 'Tambah jasa';
      if (serviceId) {
        label = 'Edit jasa';
      }
      document.title = `${label} - SewaSkill`;
    },
    [serviceId],
  );

  let content;
  if (!user) {
    content = <LoginRequired serviceId={serviceId} />;
  } else if (user.role !== 'penyedia') {
    content = <ProviderRequired />;
  } else if (serviceId && (!service || service.ownerId !== user.id)) {
    content = <CannotEdit />;
  } else {
    content = (
      <ServiceEditor
        key={serviceId || 'new'}
        service={service}
        user={user}
        saveService={saveService}
      />
    );
  }

  let description =
    'Tawarkan jasa digital dengan rincian yang jelas dan pilihan paket sesuai kebutuhan pemesan.';
  if (serviceId) {
    description =
      'Sesuaikan informasi, paket, dan harga agar tetap cocok dengan layanan yang kamu tawarkan.';
  }

  return (
    <main>
      <PageHeading
        eyebrow="RUANG UNTUK KEAHLIANMU"
        title={<PageTitle isEditing={Boolean(serviceId)} />}
        description={description}
      />
      <section className="page-section">
        <div className="container">{content}</div>
      </section>
    </main>
  );
}
