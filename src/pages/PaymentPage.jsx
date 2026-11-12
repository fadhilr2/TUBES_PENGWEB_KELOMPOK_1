import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeading, Notice, EmptyState, StatusBadge } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import { money } from '../state/format';

const paidStatuses = ['dibayar', 'dikirim', 'menunggu_admin', 'selesai'];

function getUserId(user) {
  if (user) {
    return user.id;
  }
  return null;
}

function getUserBalance(user) {
  if (user && user.balance) {
    return user.balance;
  }
  return 0;
}

function getMethodLabel(order) {
  if (order.paymentMethod) {
    return order.paymentMethod.toUpperCase();
  }
  return undefined;
}

function PaymentTitle({ paid, pending }) {
  if (paid) {
    return (
      <>
        Pembayaran <em>berhasil.</em>
      </>
    );
  }
  if (pending) {
    return (
      <>
        Selesaikan <em>pembayaranmu.</em>
      </>
    );
  }
  return (
    <>
      Pembayaran <em>ditutup.</em>
    </>
  );
}

function OrderNotFound() {
  return (
    <main>
      <PageHeading eyebrow="PEMBAYARAN DEMO" title="Pesanan tidak ditemukan." />
      <section className="page-section">
        <div className="container">
          <EmptyState
            title="Pesanan tidak tersedia"
            description="Buka riwayat untuk melihat pesanan milikmu."
          >
            <Link className="button button-blue" to="/riwayat">
              Lihat riwayat <span aria-hidden="true">↗</span>
            </Link>
          </EmptyState>
        </div>
      </section>
    </main>
  );
}

function OutcomeOption({ value, label, outcome, onChange }) {
  return (
    <label>
      <input
        type="radio"
        name="outcome"
        value={value}
        checked={outcome === value}
        onChange={onChange}
      />{' '}
      {label}
    </label>
  );
}

function PaymentForm({ outcome, insufficient, loading, onOutcomeChange, onSubmit }) {
  const payDisabled = (outcome === 'success' && insufficient) || loading;

  return (
    <form onSubmit={onSubmit} className="form-stack d-grid gap-4 mt-4">
      <fieldset className="panel">
        <legend>Hasil simulasi</legend>
        <p className="muted">
          Pilih hasil yang ingin dicoba. Tidak ada uang sungguhan yang ditagih.
        </p>
        <div className="choice-row">
          <OutcomeOption
            value="success"
            label="Berhasil"
            outcome={outcome}
            onChange={onOutcomeChange}
          />
          <OutcomeOption
            value="failed"
            label="Gagal"
            outcome={outcome}
            onChange={onOutcomeChange}
          />
        </div>
      </fieldset>
      {insufficient && (
        <Notice tone="info">
          Saldo demo tidak cukup untuk pembayaran berhasil. Pesanan masih dapat dibatalkan melalui
          riwayat.
        </Notice>
      )}
      <button className="button button-blue" type="submit" disabled={payDisabled}>
        {loading ? 'Memproses pembayaran...' : 'Bayar sekarang'}{' '}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

function PaymentSummary({ order, balance }) {
  return (
    <dl className="summary-list">
      <div>
        <dt>Harga jasa</dt>
        <dd>{money(order.price)}</dd>
      </div>
      <div>
        <dt>Biaya layanan (5%)</dt>
        <dd>{money(order.fee)}</dd>
      </div>
      <div className="summary-total">
        <dt>Total pembayaran</dt>
        <dd>{money(order.total)}</dd>
      </div>
      <div>
        <dt>Saldo demo tersedia</dt>
        <dd>{money(balance)}</dd>
      </div>
    </dl>
  );
}

function AfterPaymentPanel() {
  return (
    <aside className="panel">
      <p className="eyebrow">SETELAH PEMBAYARAN</p>
      <h2>
        Karya dimulai
        <br />
        <em>dari sini.</em>
      </h2>
      <ol className="step-list">
        <li>Penyedia mengerjakan brief dan mengirim tautan hasil.</li>
        <li>Kamu menerima hasil atau mengajukan komplain.</li>
        <li>Admin meninjau pesanan sebelum saldo diteruskan atau dikembalikan.</li>
      </ol>
      <p className="muted">Semua perubahan status dapat dilihat di riwayat pesanan.</p>
    </aside>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const { state, user, payOrder } = useDemo();
  const [outcome, setOutcome] = useState('success');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = getUserId(user);

  const order = state.orders.find(function (item) {
    return item.id === orderId && item.buyerId === userId && !item.hiddenForBuyer;
  });

  useEffect(function () {
    document.title = 'Pembayaran Demo - SewaSkill';
  }, []);

  function handleOutcomeChange(event) {
    setOutcome(event.target.value);
  }

  async function handleSubmitPayment(event) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          paymentMethod: order.paymentMethod,
          status: outcome === 'success' ? 'SUCCESS' : 'FAILED',
        }),
      });

      await payOrder(order.id, outcome === 'success');
      if (outcome === 'success') {
        setMessage({
          tone: 'success',
          text: 'Pembayaran demo berhasil. Penyedia dapat mulai mengerjakan pesananmu.',
        });
      } else {
        setMessage({
          tone: 'error',
          text: 'Simulasi pembayaran gagal. Saldo tidak berkurang dan pesanan dapat dibayar ulang.',
        });
      }
    } catch (error) {
      setMessage({ tone: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleCheckStatus() {
    if (order.status === 'menunggu_pembayaran') {
      setMessage({ tone: 'info', text: 'Pesanan masih menunggu pembayaran.' });
    } else {
      setMessage({
        tone: 'info',
        text: `Status terbaru: ${order.status.replaceAll('_', ' ')}.`,
      });
    }
  }

  if (!order) {
    return <OrderNotFound />;
  }

  const pending = order.status === 'menunggu_pembayaran';
  const paid = paidStatuses.includes(order.status);
  const balance = getUserBalance(user);
  const insufficient = balance < order.total;

  return (
    <main>
      <PageHeading
        eyebrow="SATU LANGKAH LAGI"
        title={<PaymentTitle paid={paid} pending={pending} />}
        description="Seluruh transaksi pada halaman ini merupakan simulasi dengan saldo demo."
      />
      <section className="page-section">
        <div className="container">
          <div className="row gx-lg-5 gy-4">
            <div className="col-lg-8">
              <div className="panel">
                <p className="eyebrow">PESANAN {order.id}</p>
                <h2>{order.serviceTitle}</h2>
                <p className="muted">
                  Paket {order.packageName} · {getMethodLabel(order)}
                </p>
                <StatusBadge status={order.status} />
                {message && <Notice tone={message.tone}>{message.text}</Notice>}
                <PaymentSummary order={order} balance={balance} />
                {pending && (
                  <PaymentForm
                    outcome={outcome}
                    insufficient={insufficient}
                    loading={loading}
                    onOutcomeChange={handleOutcomeChange}
                    onSubmit={handleSubmitPayment}
                  />
                )}
                <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                  <Link className="text-link" to="/riwayat">
                    Kembali ke riwayat <span aria-hidden="true">↗</span>
                  </Link>
                  <button className="text-link" type="button" onClick={handleCheckStatus}>
                    Cek status pembayaran
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <AfterPaymentPanel />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
