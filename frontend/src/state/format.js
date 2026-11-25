export function money(value = 0) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });
  let amount = Number(value);
  if (!amount) {
    amount = 0;
  }
  return formatter.format(amount);
}

export const categoryLabels = {
  desain: 'Desain & branding',
  koding: 'Web & koding',
  video: 'Video kreatif',
  konten: 'Konten & tulisan',
  foto: 'Editing foto',
};

export const categoryImages = {
  desain: '/assets/images/sora-branding.webp',
  koding: '/assets/images/studio-website.webp',
  video: '/assets/images/cerita-video.webp',
  konten: '/assets/images/ruang-kata.webp',
  foto: '/assets/images/nusa-social.webp',
};

export function servicePrice(service) {
  let packages = [];
  if (service && service.packages) {
    packages = service.packages;
  }
  let lowest = Infinity;
  for (let index = 0; index < packages.length; index++) {
    const price = Number(packages[index].price);
    if (price < lowest || Number.isNaN(price)) {
      lowest = price;
    }
  }
  return lowest;
}

export function safeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }
    return '';
  } catch {
    return '';
  }
}
