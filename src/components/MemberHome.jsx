import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../state/DemoContext';
import { categoryLabels, money } from '../state/format';
import ServiceCard from './ServiceCard';

export default function MemberHome() {
  const { state, user } = useDemo();
  const [need, setNeed] = useState('');

  if (!user) {
    return null;
  }

  function isActiveProvider(account) {
    return account.status === 'aktif' && account.role === 'penyedia';
  }

  const services = state.services.filter(function isVisibleService(item) {
    if (item.hidden) {
      return false;
    }
    if (item.ownerId === user.id) {
      return false;
    }
    const owner = state.users.find(function isOwner(account) {
      return account.id === item.ownerId;
    });
    return Boolean(owner) && isActiveProvider(owner);
  });

  const matching = services.filter(function matchesNeed(service) {
    return !need || service.category === need;
  });

  function locationScore(service) {
    if (service.location === user.location) {
      return 1;
    }
    return 0;
  }

  matching.sort(function byLocation(a, b) {
    return locationScore(b) - locationScore(a);
  });
  const recommendations = matching.slice(0, 3);

  let recentIds = [];
  if (state.recent[user.id]) {
    recentIds = state.recent[user.id];
  }
  const recentServices = [];
  for (const id of recentIds) {
    const found = services.find(function hasId(item) {
      return item.id === id;
    });
    if (found) {
      recentServices.push(found);
    }
  }
  const recent = recentServices.slice(0, 3);

  const orderCount = state.orders.filter(function isMyOrder(item) {
    return item.buyerId === user.id && !item.hiddenForBuyer;
  }).length;

  let favoriteCount = 0;
  if (state.favorites[user.id]) {
    favoriteCount = state.favorites[user.id].length;
  }

  const firstName = user.name.split(' ')[0];

  let dashboardLink = '/profil';
  let dashboardLabel = 'Profil saya';
  if (user.role === 'penyedia') {
    dashboardLink = '/dashboard-penyedia';
    dashboardLabel = 'Dashboard penyedia';
  }

  const locationLabel = user.location || 'kebutuhanmu';

  function handleNeedChange(event) {
    setNeed(event.target.value);
  }

  const categoryOptions = Object.entries(categoryLabels).map(function renderOption(entry) {
    const id = entry[0];
    const label = entry[1];
    return (
      <option key={id} value={id}>
        {label}
      </option>
    );
  });

  const recommendationCards = recommendations.map(function renderCard(service) {
    return (
      <div className="col" key={service.id}>
        <ServiceCard service={service} />
      </div>
    );
  });

  const recentCards = recent.map(function renderCard(service) {
    return (
      <div className="col" key={service.id}>
        <ServiceCard service={service} />
      </div>
    );
  });

  return (
    <section className="page-section member-home">
      <div className="container">
        <div className="section-top">
          <div>
            <p className="eyebrow dark-eyebrow">RUANG KOLABORASIMU</p>
            <h2>
              Halo, {firstName}. <em>Mulai apa hari ini?</em>
            </h2>
          </div>
          <Link className="outline-link" to={dashboardLink}>
            {dashboardLabel} ↗
          </Link>
        </div>
        <div className="stat-grid">
          <div className="row row-cols-1 row-cols-sm-3 g-4">
            <div className="col">
              <div className="stat-item">
                <span>Saldo demo</span>
                <strong>{money(user.balance)}</strong>
              </div>
            </div>
            <div className="col">
              <div className="stat-item">
                <span>Pesananmu</span>
                <strong>{orderCount}</strong>
              </div>
            </div>
            <div className="col">
              <div className="stat-item">
                <span>Jasa favorit</span>
                <strong>{favoriteCount}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="recommendation-toolbar">
          <h3 className="section-subtitle">Rekomendasi untuk {locationLabel}</h3>
          <div className="field">
            <label htmlFor="recommendation-need">Butuh bantuan untuk?</label>
            <select id="recommendation-need" value={need} onChange={handleNeedChange}>
              <option value="">Semua kebutuhan</option>
              {categoryOptions}
            </select>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">{recommendationCards}</div>
        {recent.length > 0 && (
          <>
            <h3 className="section-subtitle">Terakhir kamu lihat</h3>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">{recentCards}</div>
          </>
        )}
      </div>
    </section>
  );
}
