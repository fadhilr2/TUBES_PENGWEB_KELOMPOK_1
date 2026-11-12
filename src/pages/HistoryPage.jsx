import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading, Notice, EmptyState, StatusBadge } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { money } from '../state/format';

const statuses = [
  ['menunggu_pembayaran', 'Menunggu pembayaran'],
  ['dibayar', 'Dibayar'],
  ['dikirim', 'Hasil dikirim'],
  ['menunggu_admin', 'Menunggu admin'],
  ['selesai', 'Selesai'],
  ['direfund', 'Direfund'],
  ['dibatalkan', 'Dibatalkan'],
];
const finished = ['selesai', 'direfund', 'dibatalkan'];

function orderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  const formatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  });
  return formatter.format(date);
}

function externalUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.href;
    }
    return null;
  } catch {
    return null;
  }
}

function getUserId(user) {
  if (user) {
    return user.id;
  }
  return null;
}

function isProvider(user) {
  return Boolean(user) && user.role === 'penyedia';
}

function getMethodLabel(order) {
  if (order.paymentMethod) {
    return order.paymentMethod.toUpperCase();
  }
  return undefined;
}

function matchesSearch(order, query) {
  const text = `${order.serviceTitle} ${order.packageName} ${order.id}`.toLowerCase();
  return text.includes(query.trim().toLowerCase());
}

function matchesStatus(order, status) {
  if (!status) {
    return true;
  }
  return order.status === status;
}

function byNewest(a, b) {
  return String(b.createdAt).localeCompare(String(a.createdAt));
}

function getEmptyTitle(hasOrders, incoming) {
  if (hasOrders) {
    return 'Belum ada yang cocok.';
  }
  if (incoming) {
    return 'Belum ada pesanan masuk.';
  }
  return 'Cerita pertamamu dimulai di sini.';
}

function getEmptyDescription(hasOrders, incoming) {
  if (hasOrders) {
    return 'Coba ubah kata pencarian atau filter status.';
  }
  if (incoming) {
    return 'Bagikan jasamu agar pengguna lain bisa menemukannya.';
  }
  return 'Temukan talent yang cocok, lalu ceritakan kebutuhan proyekmu.';
}

function PayAndCancelActions({ order, runAction, actions }) {
  function handleCancel() {
    if (window.confirm('Batalkan pesanan yang belum dibayar ini?')) {
      runAction(function () {
        return actions.cancelOrder(order.id);
      }, 'Pesanan dibatalkan. Saldo demo tidak berkurang.');
    }
  }

  return (
    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
      <Link className="button button-blue" to={`/pembayaran/${order.id}`}>
        Bayar sekarang <span aria-hidden="true">↗</span>
      </Link>
      <button className="button button-danger" type="button" onClick={handleCancel}>
        Batalkan pesanan
      </button>
    </div>
  );
}

function DeliverForm({ order, runAction, actions }) {
  function handleDeliver(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const resultUrl = String(data.get('resultUrl')).trim();
    runAction(function () {
      return actions.deliverOrder(order.id, resultUrl);
    }, 'Hasil dikirim. Pembeli dapat memeriksa tautan pekerjaan.');
  }

  return (
    <form onSubmit={handleDeliver} className="form-stack d-grid gap-4 mt-4">
      <div className="field">
        <label htmlFor={`result-${order.id}`}>Tautan atau catatan hasil pekerjaan</label>
        <textarea
          id={`result-${order.id}`}
          name="resultUrl"
          rows="3"
          minLength="3"
          maxLength="3000"
          placeholder="Tautan file hasil atau catatan pekerjaan yang sudah selesai."
          required
        />
        <small>
          Gunakan tautan http/https atau tulis catatan hasil. Pastikan pembeli dapat mengakses file
          yang ditautkan.
        </small>
      </div>
      <button className="button button-blue" type="submit">
        Kirim hasil pekerjaan <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

function AcceptOrComplain({ order, runAction, actions }) {
  const [showComplaint, setShowComplaint] = useState(false);

  function handleAccept() {
    runAction(function () {
      return actions.acceptOrder(order.id);
    }, 'Pekerjaan diterima dan diteruskan ke admin untuk persetujuan.');
  }

  function handleToggleComplaint() {
    setShowComplaint(!showComplaint);
  }

  function handleComplain(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const complaint = String(data.get('complaint')).trim();
    runAction(function () {
      return actions.complainOrder(order.id, complaint);
    }, 'Komplain diteruskan kepada admin untuk ditinjau.');
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <button className="button button-blue" type="button" onClick={handleAccept}>
          Terima hasil pekerjaan
        </button>
        <button
          className="button button-outline"
          type="button"
          aria-expanded={showComplaint}
          aria-controls={`complaint-form-${order.id}`}
          onClick={handleToggleComplaint}
        >
          Ajukan komplain
        </button>
      </div>
      {showComplaint && (
        <form
          id={`complaint-form-${order.id}`}
          onSubmit={handleComplain}
          className="form-stack d-grid gap-4 mt-4"
        >
          <div className="field">
            <label htmlFor={`complaint-${order.id}`}>Alasan komplain</label>
            <textarea
              id={`complaint-${order.id}`}
              name="complaint"
              rows="3"
              required
              minLength="5"
              maxLength="2000"
              placeholder="Jelaskan bagian hasil yang tidak sesuai brief."
            />
          </div>
          <button className="button button-outline" type="submit">
            Kirim komplain ke admin
          </button>
        </form>
      )}
    </>
  );
}

function AdminWaitingNotice({ order }) {
  let firstSentence = 'Hasil diterima pembeli. Menunggu persetujuan admin.';
  if (order.complaint) {
    firstSentence = 'Komplain pembeli sedang ditinjau admin.';
  }

  return (
    <Notice tone="info">
      {firstSentence} Saldo diteruskan atau dikembalikan setelah keputusan admin.
    </Notice>
  );
}

function DeleteHistoryButton({ order, runAction, actions }) {
  function handleDelete() {
    const question =
      'Hapus pesanan ini dari riwayatmu? Catatan transaksi untuk admin tetap disimpan.';
    if (window.confirm(question)) {
      runAction(function () {
        return actions.deleteOrder(order.id);
      }, 'Pesanan dihapus dari riwayatmu.');
    }
  }

  return (
    <button className="button button-danger" type="button" onClick={handleDelete}>
      Hapus riwayat
    </button>
  );
}

function OrderActions({ order, buyer, seller, runAction, actions }) {
  const isFinished = finished.includes(order.status);

  return (
    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
      {buyer && order.status === 'menunggu_pembayaran' && (
        <PayAndCancelActions order={order} runAction={runAction} actions={actions} />
      )}
      {seller && order.status === 'dibayar' && (
        <DeliverForm order={order} runAction={runAction} actions={actions} />
      )}
      {buyer && order.status === 'dikirim' && (
        <AcceptOrComplain order={order} runAction={runAction} actions={actions} />
      )}
      {order.status === 'menunggu_admin' && <AdminWaitingNotice order={order} />}
      {buyer && isFinished && (
        <DeleteHistoryButton order={order} runAction={runAction} actions={actions} />
      )}
    </div>
  );
}

function ViewTabs({ incoming, onShowIncoming, onShowPurchases }) {
  let incomingClass = 'tab';
  let purchasesClass = 'tab';
  if (incoming) {
    incomingClass = 'tab active';
  } else {
    purchasesClass = 'tab active';
  }

  return (
    <div className="tabs" role="group" aria-label="Jenis riwayat">
      <button className={incomingClass} type="button" aria-pressed={incoming} onClick={onShowIncoming}>
        Pesanan masuk
      </button>
      <button
        className={purchasesClass}
        type="button"
        aria-pressed={!incoming}
        onClick={onShowPurchases}
      >
        Pesanan saya
      </button>
    </div>
  );
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

function FilterBar({ query, status, onQueryChange, onStatusChange }) {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <form className="filter-bar mt-4" onSubmit={handleSubmit}>
      <div className="row g-4">
        <div className="field col-md-6">
          <label htmlFor="history-query">Cari pesanan</label>
          <input
            id="history-query"
            type="search"
            value={query}
            onChange={onQueryChange}
            placeholder="Nama jasa atau nomor pesanan"
          />
        </div>
        <div className="field col-md-6">
          <label htmlFor="history-status">Status pesanan</label>
          <select id="history-status" value={status} onChange={onStatusChange}>
            <option value="">Semua status</option>
            {statuses.map(function (item) {
              return (
                <option key={item[0]} value={item[0]}>
                  {item[1]}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </form>
  );
}

function OrderAttachments({ attachments }) {
  return (
    <div>
      <h3>Aset proyek</h3>
      <ul>
        {attachments.map(function (file, index) {
          return (
            <li key={`${file.name}-${index}`}>
              {file.name}{' '}
              <span className="muted">({Math.ceil(file.size / 1024)} KB, metadata demo)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OrderResult({ resultUrl }) {
  const resultLink = externalUrl(resultUrl);

  let content = <p className="preserve-lines">{resultUrl}</p>;
  if (resultLink) {
    content = (
      <a href={resultLink} target="_blank" rel="noopener noreferrer" className="text-link">
        Buka hasil pekerjaan <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <div className="panel">
      <h3>Hasil pekerjaan</h3>
      {content}
    </div>
  );
}

function OrderDetail({ order, buyer, seller, runAction, actions }) {
  let brief = 'Tidak ada catatan tambahan.';
  if (order.brief) {
    brief = order.brief;
  }
  const hasAttachments = Boolean(order.attachments) && order.attachments.length > 0;

  return (
    <div className="order-detail">
      <div className="mt-4">
        <div className="row g-4">
          <div className="col-md-6">
            <h3>Brief proyek</h3>
            <p className="preserve-lines">{brief}</p>
            {order.deadline && <p className="muted">Deadline: {orderDate(order.deadline)}</p>}
          </div>
          <dl className="summary-list col-md-6">
            <div>
              <dt>Harga jasa</dt>
              <dd>{money(order.price)}</dd>
            </div>
            <div>
              <dt>Biaya layanan (5%)</dt>
              <dd>{money(order.fee)}</dd>
            </div>
            <div>
              <dt>Metode</dt>
              <dd>{getMethodLabel(order)}</dd>
            </div>
          </dl>
        </div>
      </div>
      {hasAttachments && <OrderAttachments attachments={order.attachments} />}
      {order.resultUrl && <OrderResult resultUrl={order.resultUrl} />}
      {order.complaint && (
        <div className="panel">
          <h3>Alasan komplain</h3>
          <p className="preserve-lines">{order.complaint}</p>
        </div>
      )}
      <OrderActions
        order={order}
        buyer={buyer}
        seller={seller}
        runAction={runAction}
        actions={actions}
      />
    </div>
  );
}

function OrderEntry({ order, incoming, userId, users, runAction, actions }) {
  const buyer = order.buyerId === userId;
  const seller = order.sellerId === userId;

  let counterpartId = order.sellerId;
  let counterpartRole = 'Penyedia';
  if (incoming) {
    counterpartId = order.buyerId;
    counterpartRole = 'Pembeli';
  }
  const counterpart = users.find(function (item) {
    return item.id === counterpartId;
  });
  let counterpartName = 'Akun dihapus';
  if (counterpart && counterpart.name) {
    counterpartName = counterpart.name;
  }

  return (
    <details className="panel order-entry">
      <summary className="order-summary">
        <div>
          <p className="eyebrow">
            {order.id} · {orderDate(order.createdAt)}
          </p>
          <h2>{order.serviceTitle}</h2>
          <p className="muted">
            {order.packageName} · {counterpartRole}: {counterpartName}
          </p>
        </div>
        <div>
          <StatusBadge status={order.status} />
          <strong>{money(order.total)}</strong>
          <span className="muted">
            Lihat detail <span aria-hidden="true">↓</span>
          </span>
        </div>
      </summary>
      <OrderDetail
        order={order}
        buyer={buyer}
        seller={seller}
        runAction={runAction}
        actions={actions}
      />
    </details>
  );
}

function OrderList({ orders, incoming, userId, users, runAction, actions }) {
  return (
    <div className="order-list">
      {orders.map(function (order) {
        return (
          <OrderEntry
            key={order.id}
            order={order}
            incoming={incoming}
            userId={userId}
            users={users}
            runAction={runAction}
            actions={actions}
          />
        );
      })}
    </div>
  );
}

function EmptyOrders({ hasOrders, incoming }) {
  let buttonTarget = '/katalog';
  let buttonLabel = 'Jelajahi katalog';
  if (incoming) {
    buttonTarget = '/jasa-saya';
    buttonLabel = 'Lihat jasa saya';
  }

  return (
    <EmptyState
      title={getEmptyTitle(hasOrders, incoming)}
      description={getEmptyDescription(hasOrders, incoming)}
    >
      <Link className="button button-blue" to={buttonTarget}>
        {buttonLabel} <span aria-hidden="true">↗</span>
      </Link>
    </EmptyState>
  );
}

export default function HistoryPage() {
  const demo = useDemo();
  const { state, user } = demo;
  const userId = getUserId(user);
  const provider = isProvider(user);

  let startView = 'purchases';
  if (provider) {
    startView = 'incoming';
  }
  const [view, setView] = useState(startView);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(null);

  const incoming = view === 'incoming' && provider;

  const orders = state.orders.filter(function (order) {
    if (incoming) {
      return order.sellerId === userId;
    }
    return order.buyerId === userId && !order.hiddenForBuyer;
  });

  const filtered = orders
    .filter(function (order) {
      return matchesStatus(order, status) && matchesSearch(order, query);
    })
    .sort(byNewest);

  const activeCount = orders.filter(function (order) {
    return !finished.includes(order.status);
  }).length;
  const completedCount = orders.filter(function (order) {
    return order.status === 'selesai';
  }).length;

  useEffect(function () {
    document.title = 'Riwayat Pesanan - SewaSkill';
  }, []);

  async function runAction(action, successMessage) {
    try {
      await action();
      setMessage({ tone: 'success', text: successMessage });
    } catch (error) {
      setMessage({ tone: 'error', text: error.message });
    }
  }

  function handleShowIncoming() {
    setView('incoming');
    setStatus('');
  }

  function handleShowPurchases() {
    setView('purchases');
    setStatus('');
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
  }

  let listContent;
  if (filtered.length === 0) {
    listContent = <EmptyOrders hasOrders={orders.length > 0} incoming={incoming} />;
  } else {
    listContent = (
      <OrderList
        orders={filtered}
        incoming={incoming}
        userId={userId}
        users={state.users}
        runAction={runAction}
        actions={demo}
      />
    );
  }

  return (
    <main>
      <PageHeading
        eyebrow="SETIAP PROYEK PUNYA CERITA"
        title={
          <>
            Pantau setiap <em>langkahnya.</em>
          </>
        }
        description="Dari pembayaran hingga hasil pekerjaan. Semua perkembangan pesananmu ada di sini."
      />
      <section className="page-section">
        <div className="container">
          {provider && (
            <ViewTabs
              incoming={incoming}
              onShowIncoming={handleShowIncoming}
              onShowPurchases={handleShowPurchases}
            />
          )}
          <div className="stat-grid">
            <div className="row row-cols-1 row-cols-sm-3 g-4">
              <StatItem value={orders.length} label="Total pesanan" />
              <StatItem value={activeCount} label="Sedang berjalan" />
              <StatItem value={completedCount} label="Pesanan selesai" />
            </div>
          </div>
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          <FilterBar
            query={query}
            status={status}
            onQueryChange={handleQueryChange}
            onStatusChange={handleStatusChange}
          />
          {listContent}
          <p className="muted">
            Transaksi, saldo, dan pembayaran di SewaSkill ini menggunakan data demo lokal.
          </p>
        </div>
      </section>
    </main>
  );
}
