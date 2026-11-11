import { Link } from 'react-router-dom';
import { useDemo } from '../state/DemoContext';
import { categoryImages, categoryLabels, money, servicePrice } from '../state/format';

export default function ServiceCard({ service }) {
  const { state, user, toggleFavorite } = useDemo();

  const owner = state.users.find(function isOwner(item) {
    return item.id === service.ownerId;
  });

  const reviews = state.reviews.filter(function isForService(item) {
    return item.serviceId === service.id;
  });

  let rating = 'Baru';
  if (reviews.length > 0) {
    let total = 0;
    for (const review of reviews) {
      total = total + Number(review.rating);
    }
    rating = (total / reviews.length).toFixed(1);
  }

  let favoriteIds = [];
  if (user && state.favorites[user.id]) {
    favoriteIds = state.favorites[user.id];
  }
  const isFavorite = favoriteIds.includes(service.id);

  const ownerIsActiveProvider = Boolean(owner) && owner.status === 'aktif' && owner.role === 'penyedia';
  const canFavorite =
    Boolean(user) && user.role !== 'admin' && !service.hidden && ownerIsActiveProvider;

  const imageSource = service.image || categoryImages[service.category];
  const categoryLabel = categoryLabels[service.category] || service.category;

  let ownerName = 'Talent SewaSkill';
  if (owner && owner.name) {
    ownerName = owner.name;
  }

  let favoriteVerb = 'Simpan';
  let favoriteIcon = '♡';
  let favoriteClass = 'favorite-button ';
  if (isFavorite) {
    favoriteVerb = 'Hapus';
    favoriteIcon = '♥';
    favoriteClass = 'favorite-button is-favorite';
  }

  function handleToggleFavorite() {
    toggleFavorite(service.id);
  }

  return (
    <article className="service-card">
      <div className="service-card-media">
        <Link to={'/detail-jasa/' + service.id} aria-label={'Lihat ' + service.title}>
          <img
            src={imageSource}
            alt={'Ilustrasi ' + service.title}
            width="640"
            height="426"
            loading="lazy"
          />
        </Link>
        {canFavorite && (
          <button
            type="button"
            className={favoriteClass}
            aria-label={favoriteVerb + ' favorit ' + service.title}
            aria-pressed={isFavorite}
            onClick={handleToggleFavorite}
          >
            {favoriteIcon}
          </button>
        )}
        <span className="project-tag">{categoryLabel}</span>
      </div>
      <div className="service-card-copy">
        <p className="service-owner">
          {ownerName} <span>{service.location}</span>
        </p>
        <h2>
          <Link to={'/detail-jasa/' + service.id}>{service.title}</Link>
        </h2>
        <div className="service-card-bottom">
          <span>
            Mulai <strong>{money(servicePrice(service))}</strong>
          </span>
          <span className="rating-label">
            ★ {rating} <small>({reviews.length})</small>
          </span>
        </div>
      </div>
    </article>
  );
}
