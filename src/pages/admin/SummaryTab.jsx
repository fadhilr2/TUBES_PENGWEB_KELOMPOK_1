import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/UI';
import { money } from '../../state/format';
import {
  countByStatus,
  formatDate,
  getAccountName,
  logDetails,
  newestFirst,
  sumBy,
} from './adminHelpers';

export default function SummaryTab({ state }) {
  const pendingOrders = state.orders.filter(function isPending(order) {
    return order.status === 'menunggu_admin';
  });
  const completedOrders = state.orders.filter(function isCompleted(order) {
    return order.status === 'selesai';
  });
  const blockedCount = state.users.filter(function isBlocked(account) {
    return account.status === 'diblokir';
  }).length;
  const visibleCount = state.services.filter(function isVisible(service) {
    return !service.hidden;
  }).length;
  const hiddenCount = state.services.filter(function isHidden(service) {
    return service.hidden;
  }).length;
  const waitingPaymentCount = countByStatus(state.orders, ['menunggu_pembayaran']);
  const inProgressCount = countByStatus(state.orders, ['dibayar', 'dikirim']);
  const refundedCount = countByStatus(state.orders, ['direfund']);
  const recentLogs = newestFirst(state.logs).slice(0, 5);

  let activity;
  if (state.logs.length > 0) {
    activity = (
      <div className="activity-list">
        {recentLogs.map(function renderLog(log) {
          return (
            <article key={log.id}>
              <strong>{log.action}</strong>
              <p>{logDetails(log)}</p>
              <small>
                {getAccountName(state.users, log.actorId)} · {formatDate(log.createdAt)}
              </small>
            </article>
          );
        })}
      </div>
    );
  } else {
    activity = (
      <EmptyState
        title="Belum ada aktivitas"
        description="Aktivitas baru akan tercatat setelah ada perubahan."
      />
    );
  }

  return (
    <>
      <div className="stat-grid">
        <div className="row row-cols-2 row-cols-lg-4 g-4">
          <div className="col">
            <article className="stat-item">
              <span>Akun terdaftar</span>
              <strong>{state.users.length}</strong>
              <small>{blockedCount} akun diblokir</small>
            </article>
          </div>
          <div className="col">
            <article className="stat-item">
              <span>Jasa di katalog</span>
              <strong>{visibleCount}</strong>
              <small>{hiddenCount} jasa disembunyikan</small>
            </article>
          </div>
          <div className="col">
            <article className="stat-item">
              <span>Perlu ditinjau</span>
              <strong>{pendingOrders.length}</strong>
              <Link className="text-link" to="/admin/pesanan">
                Tinjau pesanan <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </div>
          <div className="col">
            <article className="stat-item">
              <span>Transaksi selesai</span>
              <strong>{completedOrders.length}</strong>
              <small>Nilai jasa {money(sumBy(completedOrders, 'price'))}</small>
            </article>
          </div>
        </div>
      </div>
      <section className="panel">
        <p className="eyebrow dark-eyebrow">RINGKASAN TRANSAKSI</p>
        <h2>
          Alur yang <em>tetap terpantau.</em>
        </h2>
        <div className="stat-grid">
          <div className="row row-cols-2 row-cols-lg-4 g-4">
            <div className="col">
              <div className="stat-item">
                <span>Menunggu pembayaran</span>
                <strong>{waitingPaymentCount}</strong>
              </div>
            </div>
            <div className="col">
              <div className="stat-item">
                <span>Sedang dikerjakan / dikirim</span>
                <strong>{inProgressCount}</strong>
              </div>
            </div>
            <div className="col">
              <div className="stat-item">
                <span>Dikembalikan</span>
                <strong>{refundedCount}</strong>
              </div>
            </div>
            <div className="col">
              <div className="stat-item">
                <span>Biaya layanan dari transaksi selesai</span>
                <strong>{money(sumBy(completedOrders, 'fee'))}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="panel">
        <h2>Aktivitas terbaru</h2>
        {activity}
        <Link className="text-link" to="/admin/log">
          Lihat semua aktivitas <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
