export function PageHeading({
  eyebrow = 'RUANG TEMU IDE & KEAHLIAN',
  title,
  description,
  subtitle,
  children,
}) {
  const text = description || subtitle;

  return (
    <section className="page-heading">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {text && <p className="page-description">{text}</p>}
        {children && <div className="heading-actions">{children}</div>}
      </div>
    </section>
  );
}

export function Notice({ children, message, type, tone, onClose }) {
  const variant = type || tone || 'info';

  if (!children && !message) {
    return null;
  }

  let role = 'status';
  if (variant === 'error') {
    role = 'alert';
  }

  return (
    <div className={'notice ' + variant} role={role}>
      <div>{message || children}</div>
      {onClose && (
        <button
          type="button"
          className="notice-close"
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Belum ada data.', description, children }) {
  return (
    <div className="empty-state">
      <span className="empty-symbol" aria-hidden="true">
        ✳
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

const statusLabels = {
  menunggu_pembayaran: 'Menunggu pembayaran',
  dibayar: 'Sudah dibayar',
  dikirim: 'Hasil dikirim',
  menunggu_admin: 'Menunggu admin',
  selesai: 'Selesai',
  direfund: 'Dikembalikan',
  dibatalkan: 'Dibatalkan',
  aktif: 'Aktif',
  diblokir: 'Diblokir',
  pencari: 'Pencari jasa',
  penyedia: 'Penyedia jasa',
  admin: 'Admin',
};

export function StatusBadge({ status }) {
  const label = statusLabels[status] || status;

  return <span className={'status-badge status-' + status}>{label}</span>;
}
