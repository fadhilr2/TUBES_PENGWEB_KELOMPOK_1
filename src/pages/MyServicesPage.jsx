import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemo } from '../state/DemoContext';
import ServiceCard from '../components/ServiceCard';
import { EmptyState, Notice, PageHeading } from '../components/UI';
import { useTitle } from '../hooks/useTitle';

function AddServiceLink({ role }) {
  if (role === 'penyedia') {
    return (
      <Link className="button button-white" to="/tambah-jasa">
        Tambah jasa ↗
      </Link>
    );
  }
  return (
    <Link className="button button-white" to="/profil">
      Daftar menjadi penyedia ↗
    </Link>
  );
}

function ServiceItem({ service, onDelete }) {
  function handleDelete() {
    onDelete(service.id);
  }

  let hiddenBadge = null;
  if (service.hidden) {
    hiddenBadge = <span className="status-badge">Disembunyikan admin</span>;
  }

  return (
    <div className="col">
      <ServiceCard service={service} />
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        {hiddenBadge}
        <Link className="button button-outline" to={`/edit-jasa/${service.id}`}>
          Edit jasa
        </Link>
        <button className="button button-danger" onClick={handleDelete}>
          Hapus jasa
        </button>
      </div>
    </div>
  );
}

function NoServices({ role }) {
  let description = 'Daftar menjadi penyedia melalui profil, lalu tambahkan jasa pertamamu.';
  let linkTarget = '/profil';
  let linkLabel = 'Buka profil';
  if (role === 'penyedia') {
    description = 'Tambahkan jasa dan paket pertamamu untuk mulai menawarkan keahlian.';
    linkTarget = '/tambah-jasa';
    linkLabel = 'Tambah jasa pertama';
  }

  return (
    <EmptyState title="Keahlianmu bisa jadi awal cerita." description={description}>
      <Link className="button button-blue" to={linkTarget}>
        {linkLabel} ↗
      </Link>
    </EmptyState>
  );
}

export default function MyServicesPage() {
  useTitle('Jasa saya');
  const { state, user, deleteService } = useDemo();
  const [error, setError] = useState('');

  const services = state.services.filter(function belongsToUser(item) {
    return item.ownerId === user.id;
  });

  function handleDelete(id) {
    const confirmed = window.confirm('Hapus jasa ini beserta ulasannya?');
    if (!confirmed) {
      return;
    }
    try {
      deleteService(id);
      setError('');
    } catch (cause) {
      setError(cause.message);
    }
  }

  let errorBox = null;
  if (error) {
    errorBox = <Notice type="error">{error}</Notice>;
  }

  let content;
  if (services.length > 0) {
    const items = services.map(function renderService(service) {
      return <ServiceItem key={service.id} service={service} onDelete={handleDelete} />;
    });
    content = <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">{items}</div>;
  } else {
    content = <NoServices role={user.role} />;
  }

  return (
    <main>
      <PageHeading
        eyebrow="RUANG UNTUK KEAHLIANMU"
        title={
          <>
            Jasa kamu.
            <br />
            <em>Karya berikutnya.</em>
          </>
        }
        description="Kelola penawaran, sesuaikan paket, dan bantu ide orang lain menjadi nyata."
      >
        <AddServiceLink role={user.role} />
      </PageHeading>
      <section className="page-section">
        <div className="container">
          {errorBox}
          {content}
        </div>
      </section>
    </main>
  );
}
