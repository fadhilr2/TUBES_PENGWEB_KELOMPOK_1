import { useState } from 'react';
import { EmptyState, StatusBadge } from '../../components/UI';
import { money } from '../../state/format';
import { emptyAccount } from './adminHelpers';

function AccountRow({ account, currentUserId, onEdit, onToggleBlock, onDelete }) {
  function handleEdit() {
    onEdit(account);
  }

  function handleToggleBlock() {
    onToggleBlock(account);
  }

  function handleDelete() {
    onDelete(account);
  }

  let blockLabel = 'Blokir';
  if (account.status === 'diblokir') {
    blockLabel = 'Aktifkan';
  }

  let actions;
  if (account.role === 'admin') {
    actions = <small>Admin dilindungi</small>;
  } else {
    actions = (
      <div className="d-flex flex-wrap align-items-center gap-3">
        <button className="button button-outline" type="button" onClick={handleEdit}>
          Edit
        </button>
        <button className="button button-outline" type="button" onClick={handleToggleBlock}>
          {blockLabel}
        </button>
        <button
          className="button button-danger"
          type="button"
          disabled={account.id === currentUserId}
          onClick={handleDelete}
        >
          Hapus
        </button>
      </div>
    );
  }

  return (
    <tr>
      <td>
        <strong>{account.name}</strong>
        <small>{account.email}</small>
      </td>
      <td>{account.location || '-'}</td>
      <td>
        <StatusBadge status={account.role} />
      </td>
      <td>
        <StatusBadge status={account.status} />
      </td>
      <td>{money(account.balance || 0)}</td>
      <td>{actions}</td>
    </tr>
  );
}

export default function AccountsTab({
  state,
  currentUser,
  runAction,
  clearNotice,
  saveUser,
  deleteUser,
}) {
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [editingId, setEditingId] = useState(null);
  const [accountSearch, setAccountSearch] = useState('');

  function changeField(event) {
    const newForm = { ...accountForm };
    newForm[event.target.name] = event.target.value;
    setAccountForm(newForm);
  }

  function changeSearch(event) {
    setAccountSearch(event.target.value);
  }

  function resetForm() {
    setEditingId(null);
    setAccountForm(emptyAccount());
  }

  function startEdit(account) {
    setEditingId(account.id);
    setAccountForm({
      name: account.name,
      email: account.email,
      password: '',
      role: account.role,
      status: account.status,
      location: account.location || '',
      balance: account.balance || 0,
    });
    clearNotice();
    const nameInput = document.querySelector('#account-name');
    if (nameInput) {
      nameInput.focus();
    }
  }

  function submitForm(event) {
    event.preventDefault();
    const accountData = { ...accountForm, balance: Number(accountForm.balance) };
    let message = 'Akun demo berhasil ditambahkan.';
    if (editingId) {
      accountData.id = editingId;
      message = 'Data akun berhasil diperbarui.';
    }
    const saved = runAction(function save() {
      saveUser(accountData);
    }, message);
    if (saved) {
      resetForm();
    }
  }

  function toggleBlock(account) {
    let newStatus = 'diblokir';
    let message = 'Akun berhasil diblokir.';
    if (account.status === 'diblokir') {
      newStatus = 'aktif';
      message = 'Akun diaktifkan kembali.';
    }
    runAction(function save() {
      saveUser({ ...account, password: '', status: newStatus });
    }, message);
  }

  function removeAccount(account) {
    const confirmed = window.confirm(`Hapus akun ${account.name}?`);
    if (!confirmed) {
      return;
    }
    runAction(function remove() {
      deleteUser(account.id);
    }, 'Akun berhasil dihapus.');
  }

  const searchText = accountSearch.toLowerCase();
  const filteredAccounts = state.users.filter(function matchAccount(account) {
    const haystack = `${account.name} ${account.email} ${account.location} ${account.role}`;
    return haystack.toLowerCase().includes(searchText);
  });

  let formEyebrow = 'AKUN BARU';
  let formTitle = 'Tambah akun demo';
  let submitLabel = 'Tambah akun';
  let passwordLabel = 'Kata sandi';
  if (editingId) {
    formEyebrow = 'PERBARUI AKUN';
    formTitle = 'Edit akun';
    submitLabel = 'Simpan akun';
    passwordLabel = 'Kata sandi baru (opsional)';
  }

  let accountList;
  if (filteredAccounts.length > 0) {
    accountList = (
      <div className="table-scroll">
        <table className="data-table">
          <caption className="visually-hidden">Daftar akun demo SewaSkill</caption>
          <thead>
            <tr>
              <th scope="col">Nama &amp; email</th>
              <th scope="col">Lokasi</th>
              <th scope="col">Peran</th>
              <th scope="col">Status</th>
              <th scope="col">Saldo</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(function renderAccount(account) {
              return (
                <AccountRow
                  key={account.id}
                  account={account}
                  currentUserId={currentUser.id}
                  onEdit={startEdit}
                  onToggleBlock={toggleBlock}
                  onDelete={removeAccount}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } else {
    accountList = (
      <EmptyState title="Akun tidak ditemukan" description="Coba kata pencarian lain." />
    );
  }

  return (
    <>
      <section className="panel">
        <p className="eyebrow dark-eyebrow">{formEyebrow}</p>
        <h2>{formTitle}</h2>
        <form className="mt-4" onSubmit={submitForm}>
          <div className="row g-4">
            <div className="field col-md-6">
              <label htmlFor="account-name">Nama lengkap</label>
              <input
                id="account-name"
                name="name"
                value={accountForm.name}
                onChange={changeField}
                minLength="2"
                maxLength="80"
                required
              />
            </div>
            <div className="field col-md-6">
              <label htmlFor="account-email">Alamat email</label>
              <input
                id="account-email"
                name="email"
                type="email"
                value={accountForm.email}
                onChange={changeField}
                maxLength="120"
                required
              />
            </div>
            <div className="field col-md-6">
              <label htmlFor="account-password">{passwordLabel}</label>
              <input
                id="account-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={accountForm.password}
                onChange={changeField}
                minLength="6"
                required={!editingId}
              />
              {editingId && <small>Kosongkan untuk mempertahankan kata sandi.</small>}
            </div>
            <div className="field col-md-6">
              <label htmlFor="account-location">Kota / kabupaten</label>
              <input
                id="account-location"
                name="location"
                value={accountForm.location}
                onChange={changeField}
                maxLength="80"
                required
              />
            </div>
            <div className="field col-md-6">
              <label htmlFor="account-role">Peran</label>
              <select id="account-role" name="role" value={accountForm.role} onChange={changeField}>
                <option value="pencari">Pencari jasa</option>
                <option value="penyedia">Penyedia jasa</option>
              </select>
            </div>
            <div className="field col-md-6">
              <label htmlFor="account-status">Status akun</label>
              <select
                id="account-status"
                name="status"
                value={accountForm.status}
                onChange={changeField}
              >
                <option value="aktif">Aktif</option>
                <option value="diblokir">Diblokir</option>
              </select>
            </div>
            <div className="field col-md-6">
              <label htmlFor="account-balance">Saldo demo (Rp)</label>
              <input
                id="account-balance"
                name="balance"
                type="number"
                value={accountForm.balance}
                onChange={changeField}
                min="0"
                step="1"
                required
              />
            </div>
            <div className="col-12 d-flex flex-wrap align-items-center gap-3">
              <button className="button button-blue" type="submit">
                {submitLabel}
              </button>
              {editingId && (
                <button className="button button-outline" type="button" onClick={resetForm}>
                  Batal mengedit
                </button>
              )}
            </div>
          </div>
        </form>
      </section>
      <section className="panel">
        <div className="section-top">
          <div>
            <h2>Daftar akun</h2>
            <p>
              {filteredAccounts.length} dari {state.users.length} akun
            </p>
          </div>
          <div className="field">
            <label htmlFor="account-search">Cari akun</label>
            <input
              id="account-search"
              type="search"
              value={accountSearch}
              onChange={changeSearch}
              placeholder="Nama, email, lokasi, atau peran"
            />
          </div>
        </div>
        {accountList}
      </section>
    </>
  );
}
