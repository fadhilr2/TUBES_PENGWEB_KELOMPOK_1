import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Notice, PageHeading } from '../components/UI';
import { useDemo } from '../state/DemoContext';
import AccountsTab from './admin/AccountsTab';
import LogTab from './admin/LogTab';
import OrdersTab from './admin/OrdersTab';
import ServicesTab from './admin/ServicesTab';
import SummaryTab from './admin/SummaryTab';

const sections = [
  ['/admin', 'Ringkasan'],
  ['/admin/pesanan', 'Tinjauan pesanan'],
  ['/admin/akun', 'Kelola akun'],
  ['/admin/jasa', 'Moderasi jasa'],
  ['/admin/log', 'Log aktivitas'],
];

const headings = {
  '/admin': ['Ruang kendali', 'Pantau akun, jasa, dan perjalanan transaksi dalam satu tempat.'],
  '/admin/pesanan': [
    'Tinjau setiap hasil.',
    'Setujui penyelesaian untuk meneruskan harga jasa ke penyedia, atau tolak untuk mengembalikan total pembayaran ke pembeli.',
  ],
  '/admin/akun': [
    'Orang di balik karya.',
    'Tambah akun demo, perbarui profil dan peran, atau blokir akses akun.',
  ],
  '/admin/jasa': [
    'Jaga ruang berkarya.',
    'Tinjau posting jasa dan atur visibilitasnya di katalog.',
  ],
  '/admin/log': [
    'Setiap langkah tercatat.',
    'Riwayat perubahan akun, jasa, dan transaksi dalam penyimpanan demo ini.',
  ],
};

export default function AdminPage() {
  const { pathname } = useLocation();
  const { state, user, reviewOrder, saveUser, deleteUser, moderateService, deleteService } =
    useDemo();
  const [notice, setNotice] = useState(null);

  let currentPath = '/admin';
  if (headings[pathname]) {
    currentPath = pathname;
  }
  const title = headings[currentPath][0];
  const description = headings[currentPath][1];

  useEffect(
    function updateDocumentTitle() {
      document.title = `${title} — Admin SewaSkill`;
    },
    [title],
  );

  function clearNotice() {
    setNotice(null);
  }

  function runAction(action, message) {
    setNotice(null);
    try {
      action();
      setNotice({ type: 'success', message: message });
      return true;
    } catch (cause) {
      setNotice({ type: 'error', message: cause.message });
      return false;
    }
  }

  function getTabClassName({ isActive }) {
    if (isActive) {
      return 'tab active';
    }
    return 'tab';
  }

  const pendingCount = state.orders.filter(function isPending(order) {
    return order.status === 'menunggu_admin';
  }).length;

  let headingTitle = title;
  if (title.includes('.')) {
    headingTitle = title.slice(0, -1);
  }

  let tabContent = null;
  if (currentPath === '/admin') {
    tabContent = <SummaryTab state={state} />;
  } else if (currentPath === '/admin/pesanan') {
    tabContent = <OrdersTab state={state} runAction={runAction} reviewOrder={reviewOrder} />;
  } else if (currentPath === '/admin/akun') {
    tabContent = (
      <AccountsTab
        state={state}
        currentUser={user}
        runAction={runAction}
        clearNotice={clearNotice}
        saveUser={saveUser}
        deleteUser={deleteUser}
      />
    );
  } else if (currentPath === '/admin/jasa') {
    tabContent = (
      <ServicesTab
        state={state}
        runAction={runAction}
        moderateService={moderateService}
        deleteService={deleteService}
      />
    );
  } else if (currentPath === '/admin/log') {
    tabContent = <LogTab state={state} />;
  }

  return (
    <main>
      <PageHeading
        eyebrow="SEWASKILL / ADMIN"
        title={
          <>
            {headingTitle}
            <em>.</em>
          </>
        }
        description={description}
      />
      <section className="page-section">
        <div className="container">
          <nav className="tabs admin-tabs" aria-label="Navigasi admin">
            {sections.map(function renderTab(section) {
              const path = section[0];
              const label = section[1];
              let pendingLabel = '';
              if (path === '/admin/pesanan' && pendingCount > 0) {
                pendingLabel = ` (${pendingCount})`;
              }
              return (
                <NavLink key={path} to={path} end className={getTabClassName} onClick={clearNotice}>
                  {label}
                  {pendingLabel}
                </NavLink>
              );
            })}
          </nav>
          {notice && <Notice type={notice.type}>{notice.message}</Notice>}
          {tabContent}
        </div>
      </section>
    </main>
  );
}
