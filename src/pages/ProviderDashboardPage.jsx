import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading, EmptyState } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { money } from '../state/format';

function sumRatings(reviews) {
  let total = 0;
  for (const review of reviews) {
    total = total + Number(review.rating);
  }
  return total;
}

function sumPrices(orders) {
  let total = 0;
  for (const order of orders) {
    total = total + order.price;
  }
  return total;
}

function biggestCount(counts) {
  let biggest = 1;
  for (const count of counts) {
    if (count > biggest) {
      biggest = count;
    }
  }
  return biggest;
}

function findUser(users, userId) {
  return users.find((item) => item.id === userId);
}

function StatItem({ value, label }) {
  return (
    <div className="col">
      <div className="stat-item">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function StatGrid({ purchaseCount, average, reviewCount, income, balance }) {
  return (
    <div className="stat-grid">
      <div className="row row-cols-2 row-cols-lg-4 g-4">
        <StatItem value={purchaseCount} label="Kali dibeli" />
        <StatItem value={average} label={`Rating rata-rata · ${reviewCount} ulasan`} />
        <StatItem value={money(income)} label="Pendapatan pesanan selesai" />
        <StatItem value={money(balance)} label="Saldo demo saat ini" />
      </div>
    </div>
  );
}

function PurchaseChart({ services, purchases }) {
  const rows = [];
  const counts = [];
  for (const service of services) {
    let count = 0;
    for (const order of purchases) {
      if (order.serviceId === service.id) {
        count = count + 1;
      }
    }
    counts.push(count);
    rows.push({ service, count });
  }
  const mostPurchased = biggestCount(counts);

  let content;
  if (services.length === 0) {
    content = (
      <EmptyState
        title="Belum ada jasa"
        description="Tambahkan jasa pertamamu untuk mulai menerima pesanan."
      >
        <Link className="text-link" to="/tambah-jasa">
          Tambah jasa <span aria-hidden="true">↗</span>
        </Link>
      </EmptyState>
    );
  } else {
    const chartRows = [];
    for (const row of rows) {
      chartRows.push(
        <div className="chart-row" key={row.service.id}>
          <div>
            <Link to={`/detail-jasa?service=${row.service.id}`}>{row.service.title}</Link>
            <strong>{row.count}</strong>
          </div>
          <progress
            max={mostPurchased}
            value={row.count}
            aria-label={`${row.service.title}: ${row.count} kali dibeli`}
          />
        </div>,
      );
    }
    content = <div className="chart-list">{chartRows}</div>;
  }

  return (
    <section className="panel" aria-labelledby="purchase-chart-title">
      <p className="eyebrow">APA YANG PALING DICARI</p>
      <h2 id="purchase-chart-title">Pembelian per jasa</h2>
      <p className="muted">Pesanan yang pernah dibayar, termasuk pesanan yang direfund.</p>
      {content}
    </section>
  );
}

function RatingChart({ reviews, serviceCount }) {
  const stars = [5, 4, 3, 2, 1];
  const distribution = [];
  const counts = [];
  for (const star of stars) {
    let count = 0;
    for (const review of reviews) {
      if (Number(review.rating) === star) {
        count = count + 1;
      }
    }
    counts.push(count);
    distribution.push({ rating: star, count });
  }
  const biggestRatingCount = biggestCount(counts);

  let summary = 'Belum ada ulasan untuk jasa milikmu.';
  if (reviews.length > 0) {
    summary = `${reviews.length} ulasan untuk ${serviceCount} jasa milikmu.`;
  }

  const chartRows = [];
  for (const item of distribution) {
    chartRows.push(
      <div className="chart-row" key={item.rating}>
        <div>
          <span>{item.rating} bintang</span>
          <strong>{item.count}</strong>
        </div>
        <progress
          max={biggestRatingCount}
          value={item.count}
          aria-label={`${item.rating} bintang: ${item.count} ulasan`}
        />
      </div>,
    );
  }

  return (
    <section className="panel" aria-labelledby="rating-chart-title">
      <p className="eyebrow">SUARA PELANGGANMU</p>
      <h2 id="rating-chart-title">Sebaran rating</h2>
      <p className="muted">{summary}</p>
      <div className="chart-list">{chartRows}</div>
    </section>
  );
}

function ReviewItem({ review, users, services }) {
  const author = findUser(users, review.userId);
  const service = services.find((item) => item.id === review.serviceId);

  let authorName = 'Akun dihapus';
  if (author && author.name) {
    authorName = author.name;
  }

  let serviceTitle = 'Lihat jasa';
  if (service && service.title) {
    serviceTitle = service.title;
  }

  return (
    <article className="review-item">
      <div className="review-rating" aria-label={`${review.rating} dari 5 bintang`}>
        {review.rating} / 5
      </div>
      <div>
        <h3>{authorName}</h3>
        <p>{review.comment}</p>
        <Link className="text-link" to={`/detail-jasa?service=${review.serviceId}`}>
          {serviceTitle} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

function LatestReviews({ reviews, users, services }) {
  const sorted = [...reviews];
  sorted.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const newestReviews = sorted.slice(0, 5);

  let content;
  if (newestReviews.length === 0) {
    content = (
      <EmptyState
        title="Ulasan pertamamu menunggu."
        description="Ulasan pelanggan akan tampil setelah mereka membagikan pengalamannya."
      />
    );
  } else {
    const items = [];
    for (const review of newestReviews) {
      items.push(<ReviewItem key={review.id} review={review} users={users} services={services} />);
    }
    content = <div className="review-list">{items}</div>;
  }

  return (
    <section className="panel" aria-labelledby="latest-reviews-title">
      <div className="section-top">
        <div>
          <p className="eyebrow">MASUKAN UNTUK KARYA BERIKUTNYA</p>
          <h2 id="latest-reviews-title">Ulasan terbaru</h2>
        </div>
        <Link className="text-link" to="/jasa-saya">
          Lihat semua jasa <span aria-hidden="true">↗</span>
        </Link>
      </div>
      {content}
    </section>
  );
}

export default function ProviderDashboardPage() {
  const { state, user } = useDemo();

  useEffect(() => {
    document.title = 'Dashboard Penyedia — SewaSkill';
  }, []);

  let userId = null;
  let userName = 'kreator';
  let balance = 0;
  if (user) {
    userId = user.id;
    if (user.name) {
      userName = user.name;
    }
    if (user.balance) {
      balance = user.balance;
    }
  }

  const services = state.services.filter((service) => service.ownerId === userId);

  const serviceIds = new Set();
  for (const service of services) {
    serviceIds.add(service.id);
  }

  const purchases = [];
  const completed = [];
  for (const order of state.orders) {
    if (order.sellerId !== userId) {
      continue;
    }
    if (order.status === 'menunggu_pembayaran' || order.status === 'dibatalkan') {
      continue;
    }
    purchases.push(order);
    if (order.status === 'selesai') {
      completed.push(order);
    }
  }

  const reviews = state.reviews.filter((review) => serviceIds.has(review.serviceId));

  let average = '—';
  if (reviews.length > 0) {
    average = (sumRatings(reviews) / reviews.length).toFixed(1);
  }

  return (
    <main>
      <PageHeading
        eyebrow="RUANG TUMBUH UNTUK SKILL-MU"
        title={
          <>
            Performa jasa, <em>cerita usahamu.</em>
          </>
        }
        description={`Halo, ${userName}. Lihat perkembangan pesanan dan masukan pelanggan dari jasamu.`}
      >
        <Link className="button button-white" to="/tambah-jasa">
          Tambah jasa <span aria-hidden="true">↗</span>
        </Link>
      </PageHeading>
      <section className="page-section">
        <div className="container">
          <StatGrid
            purchaseCount={purchases.length}
            average={average}
            reviewCount={reviews.length}
            income={sumPrices(completed)}
            balance={balance}
          />
          <div className="d-flex flex-wrap align-items-center gap-3 mt-4 mb-5">
            <Link className="button button-outline" to="/riwayat">
              Kelola pesanan masuk <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" to="/jasa-saya">
              Lihat jasa saya <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div>
            <div className="row gx-lg-5 gy-4">
              <div className="col-lg-6">
                <PurchaseChart services={services} purchases={purchases} />
              </div>
              <div className="col-lg-6">
                <RatingChart reviews={reviews} serviceCount={services.length} />
              </div>
            </div>
          </div>
          <LatestReviews reviews={reviews} users={state.users} services={services} />
          <p className="muted">
            Statistik dihitung dari transaksi dan ulasan demo lokal. Pendapatan hanya bertambah
            setelah persetujuan admin.
          </p>
        </div>
      </section>
    </main>
  );
}
