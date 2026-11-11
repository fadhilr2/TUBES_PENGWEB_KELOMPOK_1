import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeading, Notice, EmptyState } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { money } from '../state/format';

const paymentMethods = [
  ['bca', 'Transfer Bank BCA'],
  ['mandiri', 'Transfer Bank Mandiri'],
  ['gopay', 'GoPay'],
  ['ovo', 'OVO'],
  ['dana', 'DANA'],
];

const MAX_ASSET_BYTES = 500 * 1024 * 1024;
const FEE_RATE = 0.05;

function localDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getUserId(user) {
  if (user) {
    return user.id;
  }
  return null;
}

function findService(services, serviceId, userId) {
  if (serviceId) {
    return services.find(function (item) {
      return item.id === serviceId;
    });
  }
  return services.find(function (item) {
    return !item.hidden && item.ownerId !== userId;
  });
}

function findPackage(service, packageId) {
  if (!service) {
    return undefined;
  }
  const chosen = service.packages.find(function (item) {
    return item.id === packageId;
  });
  if (chosen) {
    return chosen;
  }
  return service.packages[0];
}

function getUploadedFiles(formData) {
  const allFiles = formData.getAll('assets');
  return allFiles.filter(function (file) {
    return file instanceof File && file.name;
  });
}

function getTotalSize(files) {
  let totalSize = 0;
  for (const file of files) {
    totalSize = totalSize + file.size;
  }
  return totalSize;
}

function toAttachment(file) {
  return { name: file.name, size: file.size, type: file.type };
}

function readText(formData, name) {
  return String(formData.get(name)).trim();
}

function UnavailableService() {
  return (
    <main>
      <PageHeading
        eyebrow="PESAN JASA"
        title="Temukan pilihan lainnya."
        description="Jasa ini sedang tidak tersedia untuk dipesan."
      />
      <section className="page-section">
        <div className="container">
          <EmptyState
            title="Jasa belum tersedia"
            description="Pilih jasa lain yang sesuai kebutuhanmu."
          >
            <Link className="button button-blue" to="/katalog">
              Jelajahi katalog <span aria-hidden="true">↗</span>
            </Link>
          </EmptyState>
        </div>
      </section>
    </main>
  );
}

function OwnService() {
  return (
    <main>
      <PageHeading
        eyebrow="PESAN JASA"
        title="Ini adalah jasamu."
        description="Kamu dapat mengelola jasa sendiri dan menerima pesanan dari pengguna lain."
      />
      <section className="page-section">
        <div className="container">
          <EmptyState title="Tidak dapat memesan jasa sendiri">
            <Link className="button button-blue" to="/jasa-saya">
              Kelola jasa saya <span aria-hidden="true">↗</span>
            </Link>
          </EmptyState>
        </div>
      </section>
    </main>
  );
}

function BuyerFieldset({ user }) {
  let defaultName = '';
  let defaultEmail = '';
  if (user) {
    defaultName = user.name || '';
    defaultEmail = user.email || '';
  }

  return (
    <fieldset className="panel">
      <legend>01 / Data pemesan</legend>
      <div className="mt-4">
        <div className="row g-4">
          <div className="field col-md-6">
            <label htmlFor="buyer-name">Nama lengkap</label>
            <input
              id="buyer-name"
              name="buyerName"
              autoComplete="name"
              defaultValue={defaultName}
              required
              maxLength="100"
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor="buyer-email">Alamat email</label>
            <input
              id="buyer-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaultEmail}
              required
              maxLength="160"
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor="buyer-whatsapp">Nomor WhatsApp</label>
            <input
              id="buyer-whatsapp"
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="Contoh: 081234567890"
              minLength="8"
              maxLength="22"
              required
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function ProjectFieldset({ service, selectedPackage, onPackageChange }) {
  let estimatedDays = 3;
  if (service.days) {
    estimatedDays = service.days;
  }

  return (
    <fieldset className="panel">
      <legend>02 / Detail proyek</legend>
      <div className="mt-4">
        <div className="row g-4">
          <div className="field col-md-6">
            <label htmlFor="order-package">Paket jasa</label>
            <select
              id="order-package"
              name="packageId"
              value={selectedPackage.id}
              onChange={onPackageChange}
            >
              {service.packages.map(function (item) {
                return (
                  <option value={item.id} key={item.id}>
                    {item.name} — {money(item.price)}
                  </option>
                );
              })}
            </select>
            <small>{selectedPackage.description}</small>
          </div>
          <div className="field col-md-6">
            <label htmlFor="order-deadline">
              Deadline <span className="muted">(opsional)</span>
            </label>
            <input id="order-deadline" name="deadline" type="date" min={localDate()} />
            <small>Estimasi pengerjaan: {estimatedDays} hari kerja.</small>
          </div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="order-brief">Brief proyek</label>
        <textarea
          id="order-brief"
          name="brief"
          rows="6"
          minLength="10"
          maxLength="5000"
          placeholder="Ceritakan tujuan proyek, gaya yang diinginkan, referensi, dan hasil yang kamu butuhkan."
          required
        />
      </div>
      <div className="field">
        <label htmlFor="order-assets">
          Aset proyek <span className="muted">(opsional)</span>
        </label>
        <input
          id="order-assets"
          name="assets"
          type="file"
          accept="video/mp4,image/jpeg,image/png,.zip,.rar,.pdf"
          multiple
        />
        <small>
          Total maksimal 500 MB. Demo menyimpan nama dan ukuran file; isi file tidak diunggah.
        </small>
      </div>
    </fieldset>
  );
}

function PaymentMethodFieldset() {
  return (
    <fieldset className="panel">
      <legend>03 / Metode pembayaran</legend>
      <div className="field">
        <label htmlFor="payment-method">Pilih metode</label>
        <select id="payment-method" name="paymentMethod" defaultValue="bca">
          {paymentMethods.map(function (method) {
            return (
              <option value={method[0]} key={method[0]}>
                {method[1]}
              </option>
            );
          })}
        </select>
      </div>
      <p className="muted">
        Pembayaran menggunakan saldo demo. Tidak ada transfer atau tagihan uang sungguhan.
      </p>
    </fieldset>
  );
}

function OrderSummary({ service, seller, selectedPackage, fee, total }) {
  let imageSource = '/assets/images/studio-website.webp';
  if (service.image) {
    imageSource = service.image;
  }
  let sellerName = 'Penyedia jasa';
  if (seller && seller.name) {
    sellerName = seller.name;
  }

  return (
    <aside className="sticky-summary panel" aria-labelledby="order-summary-title">
      <img className="summary-image" src={imageSource} alt={`Ilustrasi ${service.title}`} />
      <p className="eyebrow">RINGKASAN PESANAN</p>
      <h2 id="order-summary-title">{service.title}</h2>
      <p className="muted">
        Oleh {sellerName} · {service.location}
      </p>
      <dl className="summary-list">
        <div>
          <dt>Paket</dt>
          <dd>{selectedPackage.name}</dd>
        </div>
        <div>
          <dt>Harga jasa</dt>
          <dd>{money(selectedPackage.price)}</dd>
        </div>
        <div>
          <dt>Biaya layanan (5%)</dt>
          <dd>{money(fee)}</dd>
        </div>
        <div className="summary-total">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>
      <p className="muted">
        Pesanan dibuat sebelum pembayaran. Kamu dapat membayar ulang atau membatalkan pesanan yang
        belum dibayar.
      </p>
    </aside>
  );
}

export default function OrderPage() {
  const { state, user, createOrder } = useDemo();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [packageChoice, setPackageChoice] = useState(params.get('package') || '');
  const [message, setMessage] = useState('');

  const userId = getUserId(user);
  const serviceId = params.get('service');
  const service = findService(state.services, serviceId, userId);
  const selectedPackage = findPackage(service, packageChoice);

  let seller;
  if (service) {
    seller = state.users.find(function (item) {
      return item.id === service.ownerId;
    });
  }

  let price = 0;
  if (selectedPackage) {
    price = selectedPackage.price || 0;
  }
  const fee = Math.round(price * FEE_RATE);
  const total = price + fee;

  useEffect(function () {
    document.title = 'Pesan Jasa — SewaSkill';
  }, []);

  function handlePackageChange(event) {
    setPackageChoice(event.target.value);
  }

  function handleSubmitOrder(event) {
    event.preventDefault();
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const files = getUploadedFiles(formData);

    if (getTotalSize(files) > MAX_ASSET_BYTES) {
      setMessage('Total ukuran aset maksimal 500 MB.');
      return;
    }

    try {
      const order = createOrder({
        serviceId: service.id,
        packageId: selectedPackage.id,
        buyerName: readText(formData, 'buyerName'),
        email: readText(formData, 'email'),
        whatsapp: readText(formData, 'whatsapp'),
        brief: readText(formData, 'brief'),
        deadline: String(formData.get('deadline') || ''),
        paymentMethod: String(formData.get('paymentMethod')),
        attachments: files.map(toAttachment),
      });
      navigate(`/pembayaran/${order.id}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const sellerBlocked = seller && seller.status === 'diblokir';

  if (!service || service.hidden || !selectedPackage || sellerBlocked) {
    return <UnavailableService />;
  }

  if (service.ownerId === userId) {
    return <OwnService />;
  }

  const detailLink = `/detail-jasa?service=${service.id}`;

  return (
    <main>
      <PageHeading
        eyebrow="DARI BRIEF MENJADI KARYA"
        title={
          <>
            Ceritakan <em>kebutuhanmu.</em>
          </>
        }
        description="Pilih paket, tulis brief yang jelas, lalu lanjutkan ke pembayaran demo."
      />
      <section className="page-section">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/katalog">Katalog</Link>
            <span aria-hidden="true">/</span>
            <Link to={detailLink}>{service.title}</Link>
            <span aria-hidden="true">/</span>
            <span>Pesan jasa</span>
          </nav>
          {message && <Notice tone="error">{message}</Notice>}
          <div>
            <div className="row gx-lg-5 gy-4">
              <div className="col-lg-8">
                <form onSubmit={handleSubmitOrder} className="form-stack d-grid gap-4 mt-4">
                  <BuyerFieldset user={user} />
                  <ProjectFieldset
                    service={service}
                    selectedPackage={selectedPackage}
                    onPackageChange={handlePackageChange}
                  />
                  <PaymentMethodFieldset />
                  <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                    <button className="button button-blue" type="submit">
                      Lanjut ke pembayaran <span aria-hidden="true">↗</span>
                    </button>
                    <Link className="text-link" to={detailLink}>
                      Kembali ke detail jasa
                    </Link>
                  </div>
                </form>
              </div>
              <div className="col-lg-4">
                <OrderSummary
                  service={service}
                  seller={seller}
                  selectedPackage={selectedPackage}
                  fee={fee}
                  total={total}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
