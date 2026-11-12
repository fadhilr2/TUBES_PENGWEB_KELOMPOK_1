import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Notice, PageHeading } from '../components/UI';
import { useDemo } from '../state/DemoContext';

const demoAccounts = [
  { role: 'Pencari jasa', email: 'deva@example.com' },
  { role: 'Penyedia jasa', email: 'rizky@example.com' },
  { role: 'Admin', email: 'admin@example.com' },
];

function getPathFromState(from) {
  if (typeof from === 'string') {
    return from;
  }
  if (from && from.pathname) {
    return `${from.pathname}${from.search || ''}${from.hash || ''}`;
  }
  return '';
}

function isSafePath(path) {
  if (!path.startsWith('/')) {
    return false;
  }
  if (path.startsWith('//')) {
    return false;
  }
  if (path.includes('\\')) {
    return false;
  }
  if (/^\/(login|register)(?:[/?#]|$)/.test(path)) {
    return false;
  }
  return true;
}

function nextPath(from, role) {
  const path = getPathFromState(from);
  if (isSafePath(path)) {
    return path;
  }
  if (role === 'admin') {
    return '/admin';
  }
  return '/';
}

function AuthHeading({ isRegister }) {
  let title;
  let description;
  if (isRegister) {
    title = (
      <>
        Mulai cerita <em>kreatifmu.</em>
      </>
    );
    description = 'Buat akun pencari jasa. Kamu bisa mendaftar menjadi penyedia setelah masuk.';
  } else {
    title = (
      <>
        Selamat datang <em>kembali.</em>
      </>
    );
    description = 'Masuk untuk menyimpan favorit, memesan jasa, dan melanjutkan kolaborasi.';
  }

  return <PageHeading eyebrow="RUANG TEMU IDE & KEAHLIAN" title={title} description={description} />;
}

function AuthForm({ isRegister, form, onChange, onSubmit }) {
  let passwordAutoComplete = 'current-password';
  let submitLabel = 'Masuk';
  if (isRegister) {
    passwordAutoComplete = 'new-password';
    submitLabel = 'Buat akun';
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="row g-4">
        {isRegister && (
          <div className="field col-md-6">
            <label htmlFor="auth-name">Nama lengkap</label>
            <input
              id="auth-name"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              minLength="2"
              maxLength="80"
              required
            />
          </div>
        )}
        <div className="field col-md-6">
          <label htmlFor="auth-email">Alamat email</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            maxLength="120"
            required
          />
        </div>
        <div className="field col-md-6">
          <label htmlFor="auth-password">Kata sandi</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete={passwordAutoComplete}
            minLength="6"
            required
          />
          <small>Minimal 6 karakter.</small>
        </div>
        {isRegister && (
          <div className="field col-md-6">
            <label htmlFor="auth-location">Kota / kabupaten</label>
            <input
              id="auth-location"
              name="location"
              value={form.location}
              onChange={onChange}
              autoComplete="address-level2"
              placeholder="Contoh: Kendari"
              maxLength="80"
              required
            />
          </div>
        )}
        <div className="col-12 d-flex flex-wrap align-items-center gap-3">
          <button className="button button-blue" type="submit">
            {submitLabel} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function AuthSwitch({ isRegister, locationState, onSwitch }) {
  let question = 'Belum punya akun? ';
  let linkPath = '/register';
  let linkLabel = 'Daftar sekarang';
  if (isRegister) {
    question = 'Sudah punya akun? ';
    linkPath = '/login';
    linkLabel = 'Masuk di sini';
  }

  return (
    <p className="auth-switch">
      {question}
      <Link className="text-link" to={linkPath} state={locationState} onClick={onSwitch}>
        {linkLabel} <span aria-hidden="true">↗</span>
      </Link>
    </p>
  );
}

function DemoAccounts({ onPick }) {
  const buttons = [];
  for (const account of demoAccounts) {
    function handleClick() {
      onPick(account.email, 'demo123');
    }

    buttons.push(
      <button
        className="button button-outline"
        key={account.email}
        type="button"
        onClick={handleClick}
      >
        <span>
          {account.role}
          <small>{account.email}</small>
        </span>
        <span aria-hidden="true">↗</span>
      </button>,
    );
  }

  return (
    <aside className="panel">
      <p className="eyebrow dark-eyebrow">COBA ALURNYA</p>
      <h2>
        Tiga peran.
        <br />
        <em>Satu kolaborasi.</em>
      </h2>
      <p>
        Gunakan akun demo untuk menjelajahi fitur. Data dan perubahan tersimpan di browser ini.
      </p>
      <div className="demo-account-list">{buttons}</div>
      <p className="demo-note">
        Kata sandi akun demo: <strong>demo123</strong>. Tidak ada pembayaran sungguhan.
      </p>
    </aside>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register } = useDemo();
  const isRegister = location.pathname === '/register';
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isRegister) {
      document.title = 'Daftar - SewaSkill';
    } else {
      document.title = 'Masuk - SewaSkill';
    }
  }, [isRegister]);

  function getFromState() {
    if (location.state) {
      return location.state.from;
    }
    return undefined;
  }

  async function enter(email, password) {
    setError('');
    try {
      const account = await login(email, password);
      navigate(nextPath(getFromState(), account.role), { replace: true });
    } catch (cause) {
      setError(cause.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isRegister) {
      enter(form.email, form.password);
      return;
    }
    setError('');
    try {
      const account = await register(form);
      navigate(nextPath(getFromState(), account.role), { replace: true });
    } catch (cause) {
      setError(cause.message);
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function clearError() {
    setError('');
  }

  if (user) {
    return <Navigate to={nextPath(getFromState(), user.role)} replace />;
  }

  let eyebrowText = 'AKUN SEWASKILL';
  let panelTitle = 'Lanjutkan idemu.';
  if (isRegister) {
    eyebrowText = 'AKUN BARU';
    panelTitle = 'Kenalan dulu, yuk.';
  }

  return (
    <main>
      <AuthHeading isRegister={isRegister} />
      <section className="page-section">
        <div className="container">
          <div className="row gx-lg-5 gy-4">
            <div className="col-lg-8">
              <div className="panel">
                <p className="eyebrow dark-eyebrow">{eyebrowText}</p>
                <h2>{panelTitle}</h2>
                {error && <Notice type="error">{error}</Notice>}
                <AuthForm
                  isRegister={isRegister}
                  form={form}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
                <AuthSwitch
                  isRegister={isRegister}
                  locationState={location.state}
                  onSwitch={clearError}
                />
              </div>
            </div>
            <div className="col-lg-4">
              <DemoAccounts onPick={enter} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
