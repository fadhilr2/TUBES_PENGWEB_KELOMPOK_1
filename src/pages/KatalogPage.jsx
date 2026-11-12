import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useDemo } from '../state/DemoContext';
import { categoryLabels, money, servicePrice } from '../state/format';
import { EmptyState, Notice, PageHeading } from '../components/UI';
import ServiceCard from '../components/ServiceCard';
import { useTitle } from '../hooks/useTitle';

function findUser(users, userId) {
  return users.find((item) => item.id === userId);
}

function isActiveProvider(users, ownerId) {
  const owner = findUser(users, ownerId);
  if (!owner) {
    return false;
  }
  return owner.status === 'aktif' && owner.role === 'penyedia';
}

function getAvailableServices(state) {
  const result = [];
  for (const service of state.services) {
    if (service.hidden) {
      continue;
    }
    if (isActiveProvider(state.users, service.ownerId)) {
      result.push(service);
    }
  }
  return result;
}

function getRating(reviews, service) {
  let total = 0;
  let count = 0;
  for (const review of reviews) {
    if (review.serviceId === service.id) {
      total = total + Number(review.rating);
      count = count + 1;
    }
  }
  if (count === 0) {
    return 0;
  }
  return total / count;
}

function getLocations(services) {
  const locations = [];
  for (const service of services) {
    if (!locations.includes(service.location)) {
      locations.push(service.location);
    }
  }
  return locations.sort();
}

function matchesFilters(service, owner, filters) {
  if (filters.favoritesOnly && !filters.favorites.includes(service.id)) {
    return false;
  }

  if (filters.query) {
    let ownerName = '';
    if (owner) {
      ownerName = owner.name;
    }
    const text = `${service.title} ${service.description} ${ownerName} ${service.location}`;
    if (!text.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }
  }

  if (filters.category && service.category !== filters.category) {
    return false;
  }

  if (filters.region && service.location !== filters.region) {
    return false;
  }

  const price = servicePrice(service);
  if (filters.minimum && price < Number(filters.minimum)) {
    return false;
  }
  if (filters.maximum && price > Number(filters.maximum)) {
    return false;
  }

  return true;
}

function sortServices(services, sort, reviews) {
  const sorted = [...services];
  if (sort === 'harga-asc') {
    sorted.sort((a, b) => servicePrice(a) - servicePrice(b));
  } else if (sort === 'harga-desc') {
    sorted.sort((a, b) => servicePrice(b) - servicePrice(a));
  } else {
    sorted.sort((a, b) => getRating(reviews, b) - getRating(reviews, a));
  }
  return sorted;
}

function CatalogHeading({ favoritesOnly, user }) {
  let eyebrow = 'KATALOG JASA DIGITAL';
  let title = (
    <>
      Skill yang tepat.
      <br />
      <em>Untuk ide hebat.</em>
    </>
  );
  let description =
    'Temukan talent berdasarkan keahlian, lokasi, dan biaya yang sesuai kebutuhanmu.';

  if (favoritesOnly) {
    eyebrow = 'SIMPAN SKILL PILIHANMU';
    title = (
      <>
        Yang kamu suka.
        <br />
        <em>Tinggal mulai.</em>
      </>
    );
    description = 'Koleksi jasa yang kamu simpan, siap untuk kolaborasi berikutnya.';
  }

  let shareLink = '/register';
  if (user) {
    shareLink = '/tambah-jasa';
  }

  return (
    <PageHeading eyebrow={eyebrow} title={title} description={description}>
      <Link className="button button-white" to={shareLink}>
        Bagikan keahlianmu ↗
      </Link>
    </PageHeading>
  );
}

function CatalogFilters({ values, setters, locations, onReset }) {
  function handleSubmit(event) {
    event.preventDefault();
  }

  function handleQuery(event) {
    setters.setQuery(event.target.value);
  }

  function handleCategory(event) {
    setters.setCategory(event.target.value);
  }

  function handleRegion(event) {
    setters.setRegion(event.target.value);
  }

  function handleMinimum(event) {
    setters.setMinimum(event.target.value);
  }

  function handleMaximum(event) {
    setters.setMaximum(event.target.value);
  }

  function handleSort(event) {
    setters.setSort(event.target.value);
  }

  const categoryOptions = [];
  for (const id of Object.keys(categoryLabels)) {
    categoryOptions.push(
      <option key={id} value={id}>
        {categoryLabels[id]}
      </option>,
    );
  }

  const locationOptions = [];
  for (const location of locations) {
    locationOptions.push(<option key={location}>{location}</option>);
  }

  return (
    <form className="catalog-filters" onSubmit={handleSubmit} aria-label="Filter katalog">
      <div className="row g-3">
        <div className="field col-12">
          <label htmlFor="search-services">Cari jasa atau talent</label>
          <input
            id="search-services"
            type="search"
            value={values.query}
            onChange={handleQuery}
            placeholder="Contoh: video, desain, atau Kendari"
          />
        </div>
        <div className="field col-12 col-md-6 col-lg-4">
          <label htmlFor="category-filter">Keahlian</label>
          <select id="category-filter" value={values.category} onChange={handleCategory}>
            <option value="">Semua keahlian</option>
            {categoryOptions}
          </select>
        </div>
        <div className="field col-12 col-md-6 col-lg-4">
          <label htmlFor="region-filter">Lokasi</label>
          <select id="region-filter" value={values.region} onChange={handleRegion}>
            <option value="">Semua lokasi</option>
            {locationOptions}
          </select>
        </div>
        <div className="field col-12 col-md-6 col-lg-4">
          <label htmlFor="minimum-price">Harga minimum</label>
          <input
            id="minimum-price"
            type="number"
            min="0"
            step="1000"
            placeholder="Rp 0"
            value={values.minimum}
            onChange={handleMinimum}
          />
        </div>
        <div className="field col-12 col-md-6 col-lg-4">
          <label htmlFor="maximum-price">Harga maksimum</label>
          <input
            id="maximum-price"
            type="number"
            min="0"
            step="1000"
            placeholder="Tanpa batas"
            value={values.maximum}
            onChange={handleMaximum}
          />
        </div>
        <div className="field col-12 col-md-6 col-lg-4">
          <label htmlFor="sort-services">Urutkan</label>
          <select id="sort-services" value={values.sort} onChange={handleSort}>
            <option value="rating">Rating tertinggi</option>
            <option value="harga-asc">Harga terendah</option>
            <option value="harga-desc">Harga tertinggi</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 d-flex align-items-end">
          <button type="button" className="button button-outline" onClick={onReset}>
            Reset filter
          </button>
        </div>
      </div>
    </form>
  );
}

function ViewToggle({ view, setView }) {
  function showGrid() {
    setView('grid');
  }

  function showTable() {
    setView('table');
  }

  let gridClass = 'tab';
  let tableClass = 'tab';
  if (view === 'grid') {
    gridClass = 'tab active';
  } else {
    tableClass = 'tab active';
  }

  return (
    <div className="tabs" role="group" aria-label="Tampilan katalog">
      <button
        type="button"
        className={gridClass}
        aria-pressed={view === 'grid'}
        onClick={showGrid}
      >
        Kartu
      </button>
      <button
        type="button"
        className={tableClass}
        aria-pressed={view === 'table'}
        onClick={showTable}
      >
        Tabel
      </button>
    </div>
  );
}

function ServiceGrid({ services }) {
  const cards = [];
  for (const service of services) {
    cards.push(
      <div className="col" key={service.id}>
        <ServiceCard service={service} />
      </div>,
    );
  }

  return <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">{cards}</div>;
}

function ServiceTable({ services, users, reviews }) {
  const rows = [];
  for (const service of services) {
    const owner = findUser(users, service.ownerId);
    let ownerName = '';
    if (owner) {
      ownerName = owner.name;
    }
    const rating = getRating(reviews, service);

    rows.push(
      <tr key={service.id}>
        <td>
          <strong>{service.title}</strong>
          <small>{ownerName}</small>
        </td>
        <td>{categoryLabels[service.category]}</td>
        <td>{service.location}</td>
        <td>{money(servicePrice(service))}</td>
        <td>★ {rating.toFixed(1)}</td>
        <td>
          <Link className="text-link" to={`/detail-jasa/${service.id}`}>
            Lihat jasa ↗
          </Link>
        </td>
      </tr>,
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="visually-hidden">Daftar jasa SewaSkill</caption>
        <thead>
          <tr>
            <th>Talent & jasa</th>
            <th>Keahlian</th>
            <th>Lokasi</th>
            <th>Mulai dari</th>
            <th>Rating</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function CatalogEmpty({ favoritesOnly, onReset }) {
  let title = 'Belum ketemu yang cocok.';
  if (favoritesOnly) {
    title = 'Belum ada favorit yang cocok.';
  }

  return (
    <EmptyState title={title} description="Coba keahlian atau kata pencarian lain.">
      <button className="button button-blue" onClick={onReset}>
        Reset pencarian
      </button>
      {favoritesOnly && (
        <Link className="text-link" to="/katalog">
          Jelajahi katalog ↗
        </Link>
      )}
    </EmptyState>
  );
}

function CatalogResults({ services, view, favoritesOnly, users, reviews, onReset }) {
  if (services.length === 0) {
    return <CatalogEmpty favoritesOnly={favoritesOnly} onReset={onReset} />;
  }
  if (view === 'grid') {
    return <ServiceGrid services={services} />;
  }
  return <ServiceTable services={services} users={users} reviews={reviews} />;
}

export default function KatalogPage() {
  const { state, user } = useDemo();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const favoritesOnly = pathname === '/favorit';

  let pageTitle = 'Katalog jasa';
  if (favoritesOnly) {
    pageTitle = 'Favorit';
  }
  useTitle(pageTitle);

  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [region, setRegion] = useState('');
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [sort, setSort] = useState('rating');
  const [view, setView] = useState('grid');

  const available = getAvailableServices(state);

  let favorites = [];
  if (user && state.favorites[user.id]) {
    favorites = state.favorites[user.id];
  }

  const filters = { favoritesOnly, favorites, query, category, region, minimum, maximum };
  const matching = [];
  for (const service of available) {
    const owner = findUser(state.users, service.ownerId);
    if (matchesFilters(service, owner, filters)) {
      matching.push(service);
    }
  }
  const services = sortServices(matching, sort, state.reviews);

  function resetFilters() {
    setQuery('');
    setCategory('');
    setRegion('');
    setMinimum('');
    setMaximum('');
    setSort('rating');
  }

  const priceRangeInvalid = Number(minimum) > Number(maximum) && maximum !== '';

  const values = { query, category, region, minimum, maximum, sort };
  const setters = { setQuery, setCategory, setRegion, setMinimum, setMaximum, setSort };

  return (
    <main>
      <CatalogHeading favoritesOnly={favoritesOnly} user={user} />
      <section className="page-section">
        <div className="container">
          <CatalogFilters
            values={values}
            setters={setters}
            locations={getLocations(available)}
            onReset={resetFilters}
          />
          {priceRangeInvalid && (
            <Notice type="error">Harga minimum tidak boleh melebihi harga maksimum.</Notice>
          )}
          <div className="catalog-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
            <p aria-live="polite">
              <strong>{services.length}</strong> jasa ditemukan
            </p>
            <ViewToggle view={view} setView={setView} />
          </div>
          <CatalogResults
            services={services}
            view={view}
            favoritesOnly={favoritesOnly}
            users={state.users}
            reviews={state.reviews}
            onReset={resetFilters}
          />
          <p className="demo-note">
            Profil, ulasan, dan transaksi menggunakan data demo. Gambar merupakan ilustrasi layanan.
          </p>
        </div>
      </section>
    </main>
  );
}
