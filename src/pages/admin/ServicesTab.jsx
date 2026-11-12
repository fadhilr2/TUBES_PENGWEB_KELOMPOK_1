import { useState } from 'react';
import { EmptyState, StatusBadge } from '../../components/UI';
import { getAccountName } from './adminHelpers';

function ServiceRow({ service, ownerName, onToggleHidden, onDelete }) {
  function handleToggle() {
    onToggleHidden(service);
  }

  function handleDelete() {
    onDelete(service);
  }

  let badgeStatus = 'ditampilkan';
  let toggleLabel = 'Sembunyikan';
  if (service.hidden) {
    badgeStatus = 'disembunyikan';
    toggleLabel = 'Tampilkan';
  }

  return (
    <tr>
      <td>
        <strong>{service.title}</strong>
        <small>{service.location}</small>
      </td>
      <td>{ownerName}</td>
      <td>{service.category}</td>
      <td>
        <StatusBadge status={badgeStatus} />
      </td>
      <td>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <button className="button button-outline" type="button" onClick={handleToggle}>
            {toggleLabel}
          </button>
          <button className="button button-danger" type="button" onClick={handleDelete}>
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ServicesTab({ state, runAction, moderateService, deleteService }) {
  const [serviceSearch, setServiceSearch] = useState('');
  const [visibility, setVisibility] = useState('all');

  function changeSearch(event) {
    setServiceSearch(event.target.value);
  }

  function changeVisibility(event) {
    setVisibility(event.target.value);
  }

  function preventSubmit(event) {
    event.preventDefault();
  }

  function toggleHidden(service) {
    let message = 'Jasa disembunyikan dari katalog.';
    if (service.hidden) {
      message = 'Jasa ditampilkan kembali di katalog.';
    }
    runAction(function moderate() {
      return moderateService(service.id, !service.hidden);
    }, message);
  }

  function removeService(service) {
    const confirmed = window.confirm(`Hapus posting jasa "${service.title}"?`);
    if (!confirmed) {
      return;
    }
    runAction(function remove() {
      return deleteService(service.id);
    }, 'Posting jasa berhasil dihapus.');
  }

  function matchesVisibility(service) {
    if (visibility === 'all') {
      return true;
    }
    if (visibility === 'hidden') {
      return Boolean(service.hidden);
    }
    return !service.hidden;
  }

  const searchText = serviceSearch.toLowerCase();
  const filteredServices = state.services.filter(function matchService(service) {
    const ownerName = getAccountName(state.users, service.ownerId);
    const haystack = `${service.title} ${ownerName} ${service.category}`;
    return haystack.toLowerCase().includes(searchText) && matchesVisibility(service);
  });

  let content;
  if (filteredServices.length > 0) {
    content = (
      <div className="table-scroll">
        <table className="data-table">
          <caption className="visually-hidden">Posting jasa untuk moderasi admin</caption>
          <thead>
            <tr>
              <th scope="col">Jasa</th>
              <th scope="col">Penyedia</th>
              <th scope="col">Kategori</th>
              <th scope="col">Status</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(function renderService(service) {
              return (
                <ServiceRow
                  key={service.id}
                  service={service}
                  ownerName={getAccountName(state.users, service.ownerId)}
                  onToggleHidden={toggleHidden}
                  onDelete={removeService}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } else {
    content = (
      <EmptyState
        title="Tidak ada jasa yang cocok"
        description="Coba ubah pencarian atau pilihan visibilitas."
      />
    );
  }

  return (
    <>
      <form className="mt-4" onSubmit={preventSubmit}>
        <div className="row g-4">
          <div className="field col-md-6">
            <label htmlFor="service-search">Cari jasa atau penyedia</label>
            <input
              id="service-search"
              type="search"
              value={serviceSearch}
              onChange={changeSearch}
              placeholder="Judul jasa, kategori, atau nama penyedia"
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor="service-visibility">Visibilitas</label>
            <select id="service-visibility" value={visibility} onChange={changeVisibility}>
              <option value="all">Semua jasa</option>
              <option value="visible">Ditampilkan</option>
              <option value="hidden">Disembunyikan</option>
            </select>
          </div>
        </div>
      </form>
      {content}
    </>
  );
}
