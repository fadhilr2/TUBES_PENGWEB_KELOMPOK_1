import { useState } from 'react';
import { EmptyState, Notice, StatusBadge } from '../../components/UI';
import { money } from '../../state/format';
import { externalUrl, formatDate, getAccountName, newestFirst } from './adminHelpers';

const otherStatuses = [
  'menunggu_pembayaran',
  'dibayar',
  'dikirim',
  'selesai',
  'direfund',
  'dibatalkan',
];

function OrderCard({ order, state, runAction, reviewOrder }) {
  function getServiceTitle() {
    if (order.serviceTitle) {
      return order.serviceTitle;
    }
    const service = state.services.find(function matchService(item) {
      return item.id === order.serviceId;
    });
    if (service && service.title) {
      return service.title;
    }
    return 'Jasa dihapus';
  }

  function approveOrder() {
    runAction(
      function approve() {
        reviewOrder(order.id, true);
      },
      `Pesanan ${order.id} disetujui. Harga jasa diteruskan ke saldo penyedia.`,
    );
  }

  function rejectOrder() {
    const confirmed = window.confirm(
      `Tolak pesanan ${order.id} dan kembalikan ${money(order.total)} ke pembeli?`,
    );
    if (!confirmed) {
      return;
    }
    runAction(
      function reject() {
        reviewOrder(order.id, false);
      },
      `Pesanan ${order.id} ditolak. Total pembayaran dikembalikan ke pembeli.`,
    );
  }

  const safeResultUrl = externalUrl(order.resultUrl);

  let resultContent = order.resultUrl;
  if (safeResultUrl) {
    resultContent = (
      <a className="text-link" href={safeResultUrl} target="_blank" rel="noreferrer">
        Buka hasil pekerjaan <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <article className="panel">
      <div className="section-top">
        <div>
          <p className="eyebrow dark-eyebrow">
            {order.id} · {formatDate(order.createdAt)}
          </p>
          <h2>{getServiceTitle()}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="order-facts">
        <dl className="row row-cols-1 row-cols-md-2 g-3 mb-0">
          <div className="col">
            <dt>Pembeli</dt>
            <dd>{getAccountName(state.users, order.buyerId)}</dd>
          </div>
          <div className="col">
            <dt>Penyedia</dt>
            <dd>{getAccountName(state.users, order.sellerId)}</dd>
          </div>
          <div className="col">
            <dt>Harga jasa untuk penyedia</dt>
            <dd>{money(order.price)}</dd>
          </div>
          <div className="col">
            <dt>Total pembayaran pembeli</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
      </div>
      <p>
        <strong>Brief:</strong> {order.brief}
      </p>
      {order.resultUrl && (
        <p>
          <strong>Hasil pekerjaan:</strong> {resultContent}
        </p>
      )}
      {order.complaint && (
        <Notice type="error">
          <strong>Keluhan pembeli:</strong> {order.complaint}
        </Notice>
      )}
      {order.status === 'menunggu_admin' && (
        <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
          <button type="button" className="button button-blue" onClick={approveOrder}>
            Setujui &amp; bayar penyedia
          </button>
          <button type="button" className="button button-danger" onClick={rejectOrder}>
            Tolak &amp; refund pembeli
          </button>
        </div>
      )}
    </article>
  );
}

export default function OrdersTab({ state, runAction, reviewOrder }) {
  const [orderStatus, setOrderStatus] = useState('menunggu_admin');

  function changeStatus(event) {
    setOrderStatus(event.target.value);
  }

  const matchingOrders = state.orders.filter(function matchStatus(order) {
    if (!orderStatus) {
      return true;
    }
    return order.status === orderStatus;
  });
  const visibleOrders = newestFirst(matchingOrders);

  let content;
  if (visibleOrders.length > 0) {
    content = (
      <div className="order-list">
        {visibleOrders.map(function renderOrder(order) {
          return (
            <OrderCard
              key={order.id}
              order={order}
              state={state}
              runAction={runAction}
              reviewOrder={reviewOrder}
            />
          );
        })}
      </div>
    );
  } else {
    content = (
      <EmptyState
        title="Tidak ada pesanan pada status ini"
        description="Pesanan yang perlu ditinjau akan muncul setelah pembeli menerima hasil atau mengajukan keluhan."
      />
    );
  }

  return (
    <>
      <div className="field">
        <label htmlFor="admin-order-status">Status pesanan</label>
        <select id="admin-order-status" value={orderStatus} onChange={changeStatus}>
          <option value="menunggu_admin">Menunggu tinjauan admin</option>
          <option value="">Semua status</option>
          {otherStatuses.map(function renderOption(status) {
            return (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            );
          })}
        </select>
      </div>
      {content}
    </>
  );
}
