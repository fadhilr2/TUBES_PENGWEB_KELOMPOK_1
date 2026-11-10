import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice, PageHeading, StatusBadge } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { money } from '../state/format';

function ProfileForm({ user, form, setForm, onSubmit }) {
  function handleName(event) {
    setForm({ ...form, name: event.target.value });
  }

  function handleLocation(event) {
    setForm({ ...form, location: event.target.value });
  }

  return (
    <form className="mt-4" onSubmit={onSubmit}>
      <div className="row g-4">
        <div className="field col-md-6">
          <label htmlFor="profile-name">Nama lengkap</label>
          <input
            id="profile-name"
            value={form.name}
            onChange={handleName}
            autoComplete="name"
            minLength="2"
            maxLength="80"
            required
          />
        </div>
        <div className="field col-md-6">
          <label htmlFor="profile-location">Kota / kabupaten</label>
          <input
            id="profile-location"
            value={form.location}
            onChange={handleLocation}
            autoComplete="address-level2"
            maxLength="80"
            required
          />
        </div>
        <div className="field col-md-6">
          <label htmlFor="profile-email">Alamat email</label>
          <input id="profile-email" type="email" value={user.email} disabled />
          <small>Email akun digunakan untuk masuk.</small>
        </div>
        <div className="col-12 d-flex flex-wrap align-items-center gap-3">
          <button className="button button-blue" type="submit">
            Simpan perubahan <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function ProviderForm({ provider, setProvider, onSubmit }) {
  function handleSkills(event) {
    setProvider({ ...provider, skills: event.target.value });
  }

  function handleExperience(event) {
    setProvider({ ...provider, experience: event.target.value });
  }

  return (
    <section className="panel">
      <p className="eyebrow dark-eyebrow">PUNYA SKILL UNTUK DIBAGIKAN?</p>
      <h2>
        Jadi bagian dari <em>karya berikutnya.</em>
      </h2>
      <p>Daftar menjadi penyedia untuk membuka Jasa Saya dan menawarkan paket keahlianmu.</p>
      <form className="mt-4" onSubmit={onSubmit}>
        <div className="row g-4">
          <div className="field col-md-6">
            <label htmlFor="provider-skills">Keahlian utama</label>
            <input
              id="provider-skills"
              value={provider.skills}
              onChange={handleSkills}
              placeholder="Contoh: desain logo, editing video"
              minLength="3"
              maxLength="200"
              required
            />
          </div>
          <div className="field col-md-6">
            <label htmlFor="provider-experience">Pengalaman singkat</label>
            <textarea
              id="provider-experience"
              value={provider.experience}
              onChange={handleExperience}
              placeholder="Ceritakan pengalaman dan karya yang pernah kamu buat."
              rows="3"
              minLength="10"
              maxLength="1000"
              required
            />
          </div>
          <div className="col-12 d-flex flex-wrap align-items-center gap-3">
            <button className="button button-outline" type="submit">
              Daftar menjadi penyedia <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function DeleteAccountForm({ user, deletion, setDeletion, hasActiveOrders, onSubmit }) {
  function handleDeletion(event) {
    setDeletion(event.target.value);
  }

  const isAdmin = user.role === 'admin';
  const inputDisabled = hasActiveOrders || isAdmin;
  const buttonDisabled = deletion !== 'HAPUS' || hasActiveOrders || isAdmin;

  return (
    <section className="panel danger-zone">
      <h2>Hapus akun</h2>
      <p>
        Penghapusan akun mengakhiri akses akun demo ini. Selesaikan semua pesanan sebelum menghapus
        akun.
      </p>
      {hasActiveOrders && (
        <Notice type="error">
          Akun belum bisa dihapus karena masih memiliki pesanan yang belum selesai.
        </Notice>
      )}
      <form className="mt-4" onSubmit={onSubmit}>
        <div className="row g-4">
          <div className="field col-md-6">
            <label htmlFor="delete-confirmation">Ketik HAPUS untuk mengonfirmasi</label>
            <input
              id="delete-confirmation"
              value={deletion}
              onChange={handleDeletion}
              autoComplete="off"
              disabled={inputDisabled}
            />
          </div>
          <div className="col-12 d-flex flex-wrap align-items-center gap-3">
            <button className="button button-danger" type="submit" disabled={buttonDisabled}>
              Hapus akun saya
            </button>
          </div>
        </div>
      </form>
      {isAdmin && <p className="demo-note">Akun admin dilindungi dari penghapusan.</p>}
    </section>
  );
}

function AccountLinks({ role }) {
  if (role === 'admin') {
    return (
      <Link className="button button-blue" to="/admin">
        Buka ruang admin <span aria-hidden="true">↗</span>
      </Link>
    );
  }

  let mainLink;
  if (role === 'penyedia') {
    mainLink = (
      <Link className="button button-blue" to="/jasa-saya">
        Kelola jasa <span aria-hidden="true">↗</span>
      </Link>
    );
  } else {
    mainLink = (
      <Link className="button button-blue" to="/katalog">
        Jelajahi jasa <span aria-hidden="true">↗</span>
      </Link>
    );
  }

  return (
    <>
      {mainLink}
      <Link className="text-link" to="/riwayat">
        Lihat riwayat pesanan <span aria-hidden="true">↗</span>
      </Link>
    </>
  );
}

function AccountSummary({ user }) {
  let locationText = 'Lokasi belum diisi';
  if (user.location) {
    locationText = user.location;
  }

  let balance = 0;
  if (user.balance) {
    balance = user.balance;
  }

  return (
    <aside className="panel sticky-summary">
      <p className="eyebrow dark-eyebrow">AKUN KAMU</p>
      <h2>{user.name}</h2>
      <StatusBadge status={user.role} />
      <p>{locationText}</p>
      <div className="summary-line">
        <span>Saldo demo</span>
        <strong>{money(balance)}</strong>
      </div>
      <p className="demo-note">
        Saldo simulasi untuk mencoba pembayaran dan penerimaan hasil transaksi.
      </p>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <AccountLinks role={user.role} />
      </div>
    </aside>
  );
}

function ProfileEditor({ user, updateProfile, becomeProvider, deleteAccount, hasActiveOrders }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, location: user.location || '' });
  const [provider, setProvider] = useState({ skills: '', experience: '' });
  const [deletion, setDeletion] = useState('');
  const [notice, setNotice] = useState(null);

  function runAction(action, message) {
    setNotice(null);
    try {
      action();
      setNotice({ type: 'success', message: message });
    } catch (cause) {
      setNotice({ type: 'error', message: cause.message });
    }
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    runAction(() => updateProfile(form), 'Profil berhasil diperbarui.');
  }

  function handleProviderSubmit(event) {
    event.preventDefault();
    runAction(
      () => becomeProvider({ ...provider, location: form.location }),
      'Kamu sekarang menjadi penyedia. Mulai tambahkan jasa pertamamu.',
    );
  }

  function handleDeleteSubmit(event) {
    event.preventDefault();
    if (deletion !== 'HAPUS') {
      return;
    }
    runAction(() => {
      deleteAccount();
      navigate('/login', { replace: true });
    }, 'Akun dihapus.');
  }

  return (
    <div>
      <div className="row gx-lg-5 gy-4">
        <div className="col-lg-8">
          <div>
            <section className="panel">
              <p className="eyebrow dark-eyebrow">DATA DIRI</p>
              <h2>
                Profil yang <em>lebih personal.</em>
              </h2>
              {notice && <Notice type={notice.type}>{notice.message}</Notice>}
              <ProfileForm
                user={user}
                form={form}
                setForm={setForm}
                onSubmit={handleProfileSubmit}
              />
            </section>
            {user.role === 'pencari' && (
              <ProviderForm
                provider={provider}
                setProvider={setProvider}
                onSubmit={handleProviderSubmit}
              />
            )}
            <DeleteAccountForm
              user={user}
              deletion={deletion}
              setDeletion={setDeletion}
              hasActiveOrders={hasActiveOrders}
              onSubmit={handleDeleteSubmit}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <AccountSummary user={user} />
        </div>
      </div>
    </div>
  );
}

function hasUnfinishedOrders(orders, userId) {
  const finishedStatuses = ['selesai', 'direfund', 'dibatalkan'];
  for (const order of orders) {
    const isMine = order.buyerId === userId || order.sellerId === userId;
    if (isMine && !finishedStatuses.includes(order.status)) {
      return true;
    }
  }
  return false;
}

export default function ProfilePage() {
  const { user, state, updateProfile, becomeProvider, deleteAccount, logout } = useDemo();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Profil — SewaSkill';
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) {
    return null;
  }

  const hasActiveOrders = hasUnfinishedOrders(state.orders, user.id);

  return (
    <main>
      <PageHeading
        eyebrow="RUANG PERSONALMU"
        title={
          <>
            Semua berawal dari <em>kamu.</em>
          </>
        }
        description="Kelola profil, lokasi, dan peranmu dalam kolaborasi."
      >
        <button className="button button-outline" type="button" onClick={handleLogout}>
          Keluar dari akun
        </button>
      </PageHeading>
      <section className="page-section">
        <div className="container">
          <ProfileEditor
            key={user.id}
            user={user}
            updateProfile={updateProfile}
            becomeProvider={becomeProvider}
            deleteAccount={deleteAccount}
            hasActiveOrders={hasActiveOrders}
          />
        </div>
      </section>
    </main>
  );
}
