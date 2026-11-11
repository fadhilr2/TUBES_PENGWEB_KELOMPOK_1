import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { EmptyState, Notice, PageHeading } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { categoryImages, categoryLabels, money, safeUrl } from '../state/format';

const RATING_OPTIONS = [5, 4, 3, 2, 1];

function findById(list, id) {
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return undefined;
}

function sortNewestFirst(reviews) {
  const copy = reviews.slice();
  copy.sort(function compare(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return copy;
}

function calculateAverageRating(reviews) {
  if (reviews.length === 0) {
    return null;
  }
  let total = 0;
  for (let i = 0; i < reviews.length; i += 1) {
    total += reviews[i].rating;
  }
  return (total / reviews.length).toFixed(1);
}

function getReviewerName(users, userId) {
  const account = findById(users, userId);
  if (account && account.name) {
    return account.name;
  }
  return 'Pengguna';
}

function formatReviewDate(value) {
  return new Date(value).toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

function getInitialNotice(location) {
  if (location.state && location.state.notice) {
    return { type: 'success', message: location.state.notice };
  }
  return null;
}

function getServiceId(params, location) {
  if (params.serviceId) {
    return params.serviceId;
  }
  const queryId = new URLSearchParams(location.search).get('service');
  if (queryId) {
    return queryId;
  }
  return 't1';
}

function ReviewEditor({ existing, serviceId, saveReview, onNotice }) {
  const startRating = existing ? existing.rating : 5;
  const startComment = existing ? existing.comment : '';
  const [rating, setRating] = useState(String(startRating || 5));
  const [comment, setComment] = useState(startComment || '');

  function handleRatingChange(event) {
    setRating(event.target.value);
  }

  function handleCommentChange(event) {
    setComment(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      serviceId: serviceId,
      rating: Number(rating),
      comment: comment,
    };
    if (existing) {
      payload.id = existing.id;
    }
    try {
      saveReview(payload);
      if (existing) {
        onNotice({ type: 'success', message: 'Ulasan berhasil diperbarui.' });
      } else {
        onNotice({ type: 'success', message: 'Terima kasih. Ulasanmu berhasil ditambahkan.' });
      }
    } catch (cause) {
      onNotice({ type: 'error', message: cause.message });
    }
  }

  let commentLabel = 'Tulis ulasanmu';
  let submitLabel = 'Kirim ulasan';
  if (existing) {
    commentLabel = 'Edit ulasanmu';
    submitLabel = 'Simpan ulasan';
  }

  const ratingOptions = RATING_OPTIONS.map(function renderOption(value) {
    return (
      <option key={value} value={value}>
        {value} dari 5
      </option>
    );
  });

  return (
    <form className="mt-4" onSubmit={handleSubmit} id="review-form">
      <div className="row g-4">
        <div className="field col-md-6">
          <label htmlFor="review-rating">Rating pengalamanmu</label>
          <select id="review-rating" value={rating} onChange={handleRatingChange} required>
            {ratingOptions}
          </select>
        </div>
        <div className="field col-12">
          <label htmlFor="review-comment">{commentLabel}</label>
          <textarea
            id="review-comment"
            rows="4"
            value={comment}
            onChange={handleCommentChange}
            minLength="3"
            maxLength="2000"
            placeholder="Ceritakan pengalaman dan hal yang membantu dalam layanan ini."
            required
          />
        </div>
        <div className="col-12 d-flex flex-wrap align-items-center gap-3">
          <button className="button button-blue" type="submit">
            {submitLabel} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function UnavailableService() {
  return (
    <main>
      <PageHeading
        eyebrow="DETAIL JASA"
        title={
          <>
            Jasa belum <em>tersedia.</em>
          </>
        }
        description="Jasa ini mungkin sudah dihapus, disembunyikan, atau penyedianya sedang tidak aktif."
      />
      <section className="page-section">
        <div className="container">
          <EmptyState
            title="Temukan pilihan lainnya"
            description="Jelajahi katalog untuk mencari skill yang sesuai dengan idemu."
          >
            <Link className="button button-blue" to="/katalog">
              Kembali ke katalog <span aria-hidden="true">↗</span>
            </Link>
          </EmptyState>
        </div>
      </section>
    </main>
  );
}

function ProviderPanel({ service, owner, rating, reviewCount }) {
  const portfolioUrl = safeUrl(service.portfolioUrl);

  let ownerName = 'Talent SewaSkill';
  if (owner && owner.name) {
    ownerName = owner.name;
  }

  let avatar = null;
  if (owner && owner.avatar) {
    avatar = (
      <img
        className="avatar-sm"
        src={owner.avatar}
        alt="Ilustrasi profil penyedia"
        width="64"
        height="64"
      />
    );
  }

  let ratingText = 'Belum ada ulasan';
  if (rating) {
    ratingText = `★ ${rating} dari ${reviewCount} ulasan`;
  }

  let portfolioLink = null;
  if (portfolioUrl) {
    portfolioLink = (
      <a className="text-link" href={portfolioUrl} target="_blank" rel="noreferrer">
        Lihat portofolio penyedia <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <section className="panel">
      <div className="provider-heading">
        {avatar}
        <div>
          <p className="eyebrow dark-eyebrow">PENYEDIA JASA</p>
          <h2>{ownerName}</h2>
          <p>
            {service.location} · {ratingText}
          </p>
        </div>
      </div>
      <h3>Tentang layanan</h3>
      <p className="preserve-lines">{service.description}</p>
      {portfolioLink}
    </section>
  );
}

function PackageCard({ pkg, days, isSelected, onSelect }) {
  let cardClass = 'package-option';
  let buttonClass = 'button button-outline';
  let buttonLabel = 'Pilih paket';
  if (isSelected) {
    cardClass = 'package-option selected';
    buttonClass = 'button button-blue';
    buttonLabel = 'Paket dipilih';
  }

  let description = 'Rincian pekerjaan disepakati melalui brief proyek.';
  if (pkg.description) {
    description = pkg.description;
  }

  function handleSelect() {
    onSelect(pkg.id);
  }

  return (
    <div className="col">
      <article className={cardClass}>
        <h3>{pkg.name}</h3>
        <p>{description}</p>
        <strong className="package-price">{money(pkg.price)}</strong>
        <p>Estimasi {days} hari kerja</p>
        <button
          className={buttonClass}
          type="button"
          onClick={handleSelect}
          aria-pressed={isSelected}
        >
          {buttonLabel}
        </button>
      </article>
    </div>
  );
}

function PackageSection({ service, selectedPackage, onSelect }) {
  const cards = service.packages.map(function renderPackage(pkg) {
    const isSelected = Boolean(selectedPackage) && selectedPackage.id === pkg.id;
    return (
      <PackageCard
        key={pkg.id}
        pkg={pkg}
        days={service.days}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  });

  return (
    <section className="panel" aria-labelledby="packages-title">
      <p className="eyebrow dark-eyebrow">SESUAIKAN DENGAN KEBUTUHANMU</p>
      <h2 id="packages-title">
        Pilih paket <em>yang tepat.</em>
      </h2>
      <div className="package-grid">
        <div className="row row-cols-1 row-cols-md-3 g-4">{cards}</div>
      </div>
    </section>
  );
}

function ReviewItem({ review, users, currentUser, onDelete }) {
  const reviewerName = getReviewerName(users, review.userId);
  const isOwnReview = Boolean(currentUser) && review.userId === currentUser.id;

  function handleEditClick() {
    const field = document.querySelector('#review-comment');
    if (field) {
      field.focus();
    }
  }

  function handleDeleteClick() {
    onDelete(review.id);
  }

  let ownerActions = null;
  if (isOwnReview) {
    ownerActions = (
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <button className="text-link" type="button" onClick={handleEditClick}>
          Edit ulasan
        </button>
        <button className="button button-danger" type="button" onClick={handleDeleteClick}>
          Hapus ulasan
        </button>
      </div>
    );
  }

  return (
    <article className="review-item">
      <div className="section-top">
        <div>
          <strong>{reviewerName}</strong>
          <p className="rating-label">
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}{' '}
            <span className="visually-hidden">{review.rating} dari 5</span>
          </p>
        </div>
        <small>{formatReviewDate(review.createdAt)}</small>
      </div>
      <p className="preserve-lines">{review.comment}</p>
      {ownerActions}
    </article>
  );
}

function ReviewForm({ user, available, service, ownReview, saveReview, onNotice }) {
  if (user && user.role === 'pencari' && available) {
    let ownId = 'new';
    let ownUpdatedAt = '';
    if (ownReview) {
      ownId = ownReview.id || 'new';
      ownUpdatedAt = ownReview.updatedAt || '';
    }
    return (
      <ReviewEditor
        key={`${ownId}-${ownUpdatedAt}`}
        existing={ownReview}
        serviceId={service.id}
        saveReview={saveReview}
        onNotice={onNotice}
      />
    );
  }
  if (!user) {
    return (
      <Link className="text-link" to="/login" state={{ from: `/detail-jasa/${service.id}` }}>
        Masuk untuk menulis ulasan <span aria-hidden="true">↗</span>
      </Link>
    );
  }
  return <p className="demo-note">Ulasan dapat ditulis melalui akun pencari jasa.</p>;
}

function ReviewSection({
  reviews,
  rating,
  users,
  user,
  available,
  service,
  ownReview,
  saveReview,
  onNotice,
  onDelete,
}) {
  let ratingLabel = 'Belum ada rating';
  if (rating) {
    ratingLabel = `★ ${rating} / 5`;
  }

  let reviewList = <p>Belum ada ulasan. Jadilah yang pertama berbagi pengalaman.</p>;
  if (reviews.length > 0) {
    const items = reviews.map(function renderReview(review) {
      return (
        <ReviewItem
          key={review.id}
          review={review}
          users={users}
          currentUser={user}
          onDelete={onDelete}
        />
      );
    });
    reviewList = <div className="review-list">{items}</div>;
  }

  return (
    <section className="panel" aria-labelledby="reviews-title">
      <div className="section-top">
        <div>
          <p className="eyebrow dark-eyebrow">CERITA PENGGUNA</p>
          <h2 id="reviews-title">
            Ulasan <em>layanan.</em>
          </h2>
        </div>
        <span className="rating-label">{ratingLabel}</span>
      </div>
      {reviewList}
      <ReviewForm
        user={user}
        available={available}
        service={service}
        ownReview={ownReview}
        saveReview={saveReview}
        onNotice={onNotice}
      />
    </section>
  );
}

function FaqSection() {
  return (
    <section className="panel">
      <h2>
        Sebelum <em>mulai.</em>
      </h2>
      <details className="faq-item">
        <summary>Apa yang perlu disiapkan sebelum memesan?</summary>
        <p>
          Siapkan brief, referensi, dan daftar hasil yang kamu butuhkan. Pastikan pilihan paket
          serta estimasi pengerjaannya sesuai dengan proyekmu.
        </p>
      </details>
      <details className="faq-item">
        <summary>Bagaimana pembayaran dan penyerahan hasilnya?</summary>
        <p>
          Di versi demo, pembayaran memakai saldo simulasi. Penyedia mengirim hasil melalui riwayat
          pesanan, pembeli meninjau, lalu admin memutuskan penyelesaian atau refund.
        </p>
      </details>
    </section>
  );
}

function OrderAction({ user, isOwner, available, service, orderPath }) {
  if (isOwner) {
    return (
      <Link className="button button-blue" to={`/edit-jasa/${service.id}`}>
        Edit jasa ini <span aria-hidden="true">↗</span>
      </Link>
    );
  }
  if (user && (user.role === 'penyedia' || user.role === 'admin')) {
    return <p className="demo-note">Pemesanan tersedia untuk akun pencari jasa.</p>;
  }
  if (available) {
    return (
      <Link className="button button-blue" to={orderPath}>
        Pesan paket ini <span aria-hidden="true">↗</span>
      </Link>
    );
  }
  return null;
}

function FavoriteButton({ user, available, favorite, onToggle }) {
  if (!user || user.role === 'admin' || !available) {
    return null;
  }
  let label = '♡ Simpan ke favorit';
  if (favorite) {
    label = '♥ Tersimpan di favorit';
  }
  return (
    <button className="button button-outline" type="button" aria-pressed={favorite} onClick={onToggle}>
      {label}
    </button>
  );
}

function SummaryPanel({
  service,
  selectedPackage,
  user,
  isOwner,
  available,
  favorite,
  orderPath,
  onToggleFavorite,
}) {
  let packageName = 'Paket layanan';
  let packageDescription = '';
  let packagePrice = 0;
  if (selectedPackage) {
    packageName = selectedPackage.name || 'Paket layanan';
    packageDescription = selectedPackage.description;
    packagePrice = selectedPackage.price || 0;
  }

  return (
    <aside className="panel sticky-summary">
      <p className="eyebrow dark-eyebrow">LANGKAH PERTAMA MENUJU KARYAMU</p>
      <h2>{packageName}</h2>
      <p>{packageDescription}</p>
      <strong className="summary-price">{money(packagePrice)}</strong>
      <dl className="summary-details">
        <div>
          <dt>Estimasi pengerjaan</dt>
          <dd>{service.days} hari kerja</dd>
        </div>
        <div>
          <dt>Biaya layanan saat memesan</dt>
          <dd>5% dari harga paket</dd>
        </div>
      </dl>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <OrderAction
          user={user}
          isOwner={isOwner}
          available={available}
          service={service}
          orderPath={orderPath}
        />
        <FavoriteButton
          user={user}
          available={available}
          favorite={favorite}
          onToggle={onToggleFavorite}
        />
      </div>
      <p className="demo-note">
        Pilih paket dan tulis kebutuhanmu dengan jelas. Tidak ada pembayaran sungguhan pada demo
        ini.
      </p>
    </aside>
  );
}

export default function DetailJasaPage() {
  const params = useParams();
  const location = useLocation();
  const serviceId = getServiceId(params, location);
  const { state, user, viewService, toggleFavorite, saveReview, deleteReview } = useDemo();
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [notice, setNotice] = useState(function readInitialNotice() {
    return getInitialNotice(location);
  });

  const service = findById(state.services, serviceId);
  let owner = null;
  if (service) {
    owner = findById(state.users, service.ownerId) || null;
  }

  let available = false;
  if (service && !service.hidden && owner && owner.status === 'aktif' && owner.role === 'penyedia') {
    available = true;
  }

  const userId = user ? user.id : undefined;
  const userRole = user ? user.role : undefined;
  const isOwner = Boolean(service) && Boolean(user) && user.id === service.ownerId;
  const mayPreview = isOwner || userRole === 'admin';

  const serviceReviews = state.reviews.filter(function matchService(review) {
    return review.serviceId === serviceId;
  });
  const reviews = sortNewestFirst(serviceReviews);
  const ownReview = reviews.find(function matchUser(review) {
    return review.userId === userId;
  });
  const rating = calculateAverageRating(reviews);

  let selectedPackage = null;
  if (service) {
    selectedPackage = findById(service.packages, selectedPackageId) || service.packages[0];
  }

  let favorite = false;
  if (user) {
    const favoriteIds = state.favorites[user.id] || [];
    favorite = favoriteIds.includes(serviceId);
  }

  const serviceTitle = service ? service.title : undefined;

  useEffect(
    function updateTitle() {
      document.title = `${serviceTitle || 'Detail jasa'} - SewaSkill`;
    },
    [serviceTitle],
  );

  useEffect(
    function recordView() {
      if (available && userId && userRole !== 'admin') {
        viewService(serviceId);
      }
    },
    [available, serviceId, userId, userRole, viewService],
  );

  function runAction(callback, message) {
    try {
      callback();
      setNotice({ type: 'success', message: message });
    } catch (cause) {
      setNotice({ type: 'error', message: cause.message });
    }
  }

  function handleCloseNotice() {
    setNotice(null);
  }

  function handleSelectPackage(packageId) {
    setSelectedPackageId(packageId);
  }

  function handleToggleFavorite() {
    let message = 'Jasa disimpan ke favorit.';
    if (favorite) {
      message = 'Jasa dihapus dari favorit.';
    }
    runAction(function toggle() {
      toggleFavorite(service.id);
    }, message);
  }

  function handleDeleteReview(reviewId) {
    const confirmed = window.confirm('Hapus ulasanmu untuk jasa ini?');
    if (!confirmed) {
      return;
    }
    runAction(function remove() {
      deleteReview(reviewId);
    }, 'Ulasan berhasil dihapus.');
  }

  if (!service || (!available && !mayPreview)) {
    return <UnavailableService />;
  }

  let packageId = '';
  if (selectedPackage) {
    packageId = selectedPackage.id;
  }
  const orderPath = `/order?service=${encodeURIComponent(service.id)}&package=${encodeURIComponent(packageId)}`;

  const categoryLabel = categoryLabels[service.category] || service.category;
  const coverImage = service.image || categoryImages[service.category];
  const ownerName = owner && owner.name ? owner.name : 'talent SewaSkill';

  let noticeBox = null;
  if (notice) {
    noticeBox = (
      <Notice type={notice.type} onClose={handleCloseNotice}>
        {notice.message}
      </Notice>
    );
  }

  let hiddenNotice = null;
  if (!available) {
    hiddenNotice = (
      <Notice>
        Jasa ini sedang tidak ditampilkan kepada pencari. Kamu dapat melihatnya sebagai pemilik
        atau admin.
      </Notice>
    );
  }

  return (
    <main>
      <PageHeading
        eyebrow={`${categoryLabel} / ${service.location}`}
        title={service.title}
        description={`Berkarya bersama ${ownerName}. Pilih paket yang paling sesuai dengan kebutuhan proyekmu.`}
      >
        <Link className="text-link" to="/katalog">
          ← Kembali ke katalog
        </Link>
      </PageHeading>
      <section className="page-section">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <Link to="/katalog">Katalog</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Detail jasa</span>
          </nav>
          {noticeBox}
          {hiddenNotice}
          <div>
            <div className="row gx-lg-5 gy-4">
              <div className="col-lg-8">
                <div>
                  <img
                    className="detail-cover"
                    src={coverImage}
                    alt={`Ilustrasi layanan ${service.title}`}
                    width="1280"
                    height="853"
                  />
                  <p className="demo-note">
                    Visual ilustrasi layanan. Detail profil, ulasan, dan transaksi menggunakan data
                    demo.
                  </p>
                  <ProviderPanel
                    service={service}
                    owner={owner}
                    rating={rating}
                    reviewCount={reviews.length}
                  />
                  <PackageSection
                    service={service}
                    selectedPackage={selectedPackage}
                    onSelect={handleSelectPackage}
                  />
                  <ReviewSection
                    reviews={reviews}
                    rating={rating}
                    users={state.users}
                    user={user}
                    available={available}
                    service={service}
                    ownReview={ownReview}
                    saveReview={saveReview}
                    onNotice={setNotice}
                    onDelete={handleDeleteReview}
                  />
                  <FaqSection />
                </div>
              </div>
              <div className="col-lg-4">
                <SummaryPanel
                  service={service}
                  selectedPackage={selectedPackage}
                  user={user}
                  isOwner={isOwner}
                  available={available}
                  favorite={favorite}
                  orderPath={orderPath}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
