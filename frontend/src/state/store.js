import { api } from './api';

function createEmptyState() {
  return {
    users: [],
    services: [],
    orders: [],
    reviews: [],
    favorites: {},
    recent: {},
    logs: [],
    summary: null,
    dashboard: null,
  };
}

let snapshot = {
  state: createEmptyState(),
  user: null,
  ready: false,
  error: null,
  busy: false,
  routeKey: '',
};
let currentRoute = { pathname: '/', search: '' };
let requestController;
const listeners = new Set();

function publish(changes) {
  snapshot = { ...snapshot, ...changes };
  for (const listener of listeners) {
    listener();
  }
}

function encodeId(id) {
  return encodeURIComponent(id);
}

async function getData(path, signal) {
  const response = await api.request(path, { signal });
  return response.data;
}

async function getOptionalData(path, signal) {
  try {
    return await getData(path, signal);
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

function removeDuplicates(rows) {
  const result = [];
  for (const row of rows) {
    const index = result.findIndex((item) => item.id === row.id);
    if (index === -1) {
      result.push(row);
    } else {
      result[index] = row;
    }
  }
  return result;
}

function collectRelatedUsers(data, user) {
  for (const service of data.services) {
    if (service.owner) {
      data.users.push(service.owner);
    }
  }
  for (const review of data.reviews) {
    if (review.user) {
      data.users.push(review.user);
    }
  }
  for (const order of data.orders) {
    if (order.buyer) {
      data.users.push(order.buyer);
    }
    if (order.seller) {
      data.users.push(order.seller);
    }
  }

  data.users = removeDuplicates(data.users);
  if (user) {
    data.users = data.users.filter((account) => account.id !== user.id);
    data.users.push(user);
  }
}

async function loadPageData(pathname, search, user, signal) {
  const data = createEmptyState();
  const isAdmin = user?.role === 'admin';
  const isProvider = user?.role === 'penyedia';
  const isMember = Boolean(user) && !isAdmin;
  const isCatalogPage = ['/', '/katalog', '/favorit'].includes(pathname);

  if (isCatalogPage && !isAdmin) {
    data.services = await api.list('/services', { signal });
  }

  if (isMember && (isCatalogPage || pathname.startsWith('/detail-jasa'))) {
    const favorites = await api.list('/users/me/favorites', { signal });
    data.favorites[user.id] = [];
    for (const service of favorites) {
      data.favorites[user.id].push(service.id);
    }
  }

  if (isMember && pathname === '/') {
    const recentServices = await getData('/users/me/recent', signal);
    data.recent[user.id] = [];
    for (const service of recentServices) {
      data.recent[user.id].push(service.id);
      data.services.push(service);
    }
    data.orders = await api.list('/orders', { signal });
  }

  if (isMember && (pathname === '/profil' || pathname === '/riwayat')) {
    data.orders = await api.list('/orders', { signal });
    if (isProvider) {
      const incomingOrders = await api.list('/orders', { signal, query: { view: 'incoming' } });
      data.orders.push(...incomingOrders);
    }
  }

  if (isProvider && pathname === '/jasa-saya') {
    data.services = await api.list('/users/me/services', { signal });
  }

  if (isProvider && pathname.startsWith('/edit-jasa/')) {
    const serviceId = pathname.split('/').pop();
    const service = await getOptionalData('/users/me/services/' + encodeId(serviceId), signal);
    if (service) {
      data.services.push(service);
    }
  }

  if (pathname.startsWith('/detail-jasa') || (isMember && pathname === '/order')) {
    const params = new URLSearchParams(search);
    let serviceId = params.get('service') || 't1';
    if (pathname.startsWith('/detail-jasa/')) {
      serviceId = pathname.split('/').pop();
    }

    const encodedId = encodeId(serviceId);
    let service = await getOptionalData('/services/' + encodedId, signal);
    if (!service && isProvider) {
      service = await getOptionalData('/users/me/services/' + encodedId, signal);
    }
    if (!service && isAdmin) {
      service = await getOptionalData('/admin/services/' + encodedId, signal);
    }
    if (service) {
      data.services.push(service);
      if (service.available) {
        data.reviews = await api.list('/services/' + encodedId + '/reviews', { signal });
      }
    }
  }

  if (isMember && pathname.startsWith('/pembayaran/')) {
    const orderId = pathname.split('/').pop();
    const order = await getOptionalData('/orders/' + encodeId(orderId), signal);
    if (order) {
      data.orders.push(order);
    }
  }

  if (isProvider && pathname === '/dashboard-penyedia') {
    data.dashboard = await getData('/dashboard/provider', signal);
    data.services = data.dashboard.services;
    data.reviews = data.dashboard.latestReviews;
  }

  if (isAdmin && pathname.startsWith('/admin')) {
    data.summary = await getData('/admin/summary', signal);
    if (pathname === '/admin/akun') {
      data.users = await api.list('/admin/users', { signal });
    }
    if (pathname === '/admin/jasa') {
      data.services = await api.list('/admin/services', { signal });
    }
    if (pathname === '/admin/pesanan') {
      data.orders = await api.list('/admin/orders', { signal });
    }
    if (pathname === '/admin/log') {
      data.logs = await api.list('/admin/logs', { signal });
    }
  }

  data.services = removeDuplicates(data.services);
  data.orders = removeDuplicates(data.orders);
  collectRelatedUsers(data, user);
  return data;
}

async function load(pathname, search = '', silent = false) {
  currentRoute = { pathname, search };
  if (requestController) {
    requestController.abort();
  }
  requestController = new AbortController();
  const signal = requestController.signal;
  const routeKey = pathname + search;

  if (!silent) {
    publish({ ready: false, error: null });
  }

  try {
    let user = null;
    try {
      user = await getData('/auth/me', signal);
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
    }

    const data = await loadPageData(pathname, search, user, signal);
    if (!signal.aborted) {
      publish({ state: data, user, ready: true, error: null, routeKey });
    }
  } catch (error) {
    if (!signal.aborted) {
      publish({ error, ready: true, routeKey });
    }
  }
}

async function mutate(path, method, body, refreshAfter = true) {
  if (snapshot.busy) {
    throw new Error('Permintaan sebelumnya masih diproses.');
  }

  publish({ busy: true });
  try {
    const response = await api.request(path, { method, body });
    if (refreshAfter) {
      await load(currentRoute.pathname, currentRoute.search, true);
    }
    return response.data;
  } catch (error) {
    if (error.status === 401) {
      publish({ user: null, state: createEmptyState() });
    }
    throw error;
  } finally {
    publish({ busy: false });
  }
}

export const store = {
  subscribe(listener) {
    listeners.add(listener);
    return function unsubscribe() {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return snapshot;
  },
  load,
  async login(email, password) {
    const user = await mutate('/auth/login', 'POST', { email, password });
    publish({ user });
    return user;
  },
  async register(body) {
    const user = await mutate('/auth/register', 'POST', body);
    publish({ user });
    return user;
  },
  async logout() {
    await mutate('/auth/logout', 'POST', undefined, false);
    publish({ user: null, state: createEmptyState(), error: null });
    await load(currentRoute.pathname, currentRoute.search, true);
  },
  async refresh() {
    if (snapshot.busy) {
      return snapshot.state;
    }
    publish({ busy: true });
    try {
      await load(currentRoute.pathname, currentRoute.search, true);
      if (snapshot.error) {
        throw snapshot.error;
      }
      return snapshot.state;
    } finally {
      publish({ busy: false });
    }
  },
  updateProfile(body) {
    return mutate('/users/me', 'PATCH', body);
  },
  becomeProvider(body) {
    return mutate('/users/me/provider', 'POST', body);
  },
  async deleteAccount() {
    await mutate('/users/me', 'DELETE', { confirmation: 'HAPUS' }, false);
    publish({ user: null, state: createEmptyState() });
  },
  saveService(draft) {
    const body = {
      title: draft.title,
      category: draft.category,
      description: draft.description,
      days: draft.days,
      portfolioUrl: draft.portfolioUrl,
      image: draft.image,
      packages: [],
    };
    for (const servicePackage of draft.packages) {
      body.packages.push({
        id: servicePackage.id,
        name: servicePackage.name,
        description: servicePackage.description,
        price: servicePackage.price,
      });
    }
    if (draft.id) {
      return mutate('/services/' + encodeId(draft.id), 'PATCH', body);
    }
    return mutate('/services', 'POST', body);
  },
  deleteService(id) {
    let path = '/services/' + encodeId(id);
    if (snapshot.user?.role === 'admin') {
      path = '/admin/services/' + encodeId(id);
    }
    return mutate(path, 'DELETE');
  },
  moderateService(id, hidden) {
    return mutate('/admin/services/' + encodeId(id) + '/moderation', 'PATCH', { hidden });
  },
  toggleFavorite(id) {
    const favorites = snapshot.state.favorites[snapshot.user?.id] || [];
    const path = '/users/me/favorites/' + encodeId(id);
    if (favorites.includes(id)) {
      return mutate(path, 'DELETE');
    }
    return mutate(path, 'PUT');
  },
  async viewService(id) {
    await api.request('/users/me/recent/' + encodeId(id), { method: 'POST' });
  },
  saveReview(draft) {
    const body = { rating: draft.rating, comment: draft.comment };
    if (draft.id) {
      return mutate('/reviews/' + encodeId(draft.id), 'PATCH', body);
    }
    return mutate('/services/' + encodeId(draft.serviceId) + '/reviews', 'POST', body);
  },
  deleteReview(id) {
    return mutate('/reviews/' + encodeId(id), 'DELETE');
  },
  createOrder(body) {
    return mutate('/orders', 'POST', body);
  },
  payOrder(id, success = true) {
    return mutate('/orders/' + encodeId(id) + '/payment', 'POST', { success });
  },
  async paymentConfig() {
    const response = await api.request('/payments/config');
    return response.data;
  },
  startMidtrans(id) {
    return mutate('/payments/orders/' + encodeId(id) + '/checkout', 'POST', undefined, false);
  },
  syncMidtrans(id) {
    return mutate('/payments/orders/' + encodeId(id) + '/sync', 'POST');
  },
  cancelOrder(id) {
    return mutate('/orders/' + encodeId(id) + '/cancel', 'POST');
  },
  deliverOrder(id, resultUrl) {
    return mutate('/orders/' + encodeId(id) + '/delivery', 'POST', { resultUrl });
  },
  acceptOrder(id) {
    return mutate('/orders/' + encodeId(id) + '/decision', 'POST', { accepted: true });
  },
  complainOrder(id, complaint) {
    return mutate('/orders/' + encodeId(id) + '/decision', 'POST', { accepted: false, complaint });
  },
  deleteOrder(id) {
    return mutate('/orders/' + encodeId(id) + '/history', 'DELETE');
  },
  reviewOrder(id, approve) {
    return mutate('/admin/orders/' + encodeId(id) + '/review', 'POST', { approve });
  },
  saveUser(draft) {
    const body = {
      name: draft.name,
      email: draft.email,
      location: draft.location,
      role: draft.role,
      status: draft.status,
      balance: draft.balance,
    };
    if (draft.password) {
      body.password = draft.password;
    }
    if (draft.id) {
      return mutate('/admin/users/' + encodeId(draft.id), 'PATCH', body);
    }
    return mutate('/admin/users', 'POST', body);
  },
  deleteUser(id) {
    return mutate('/admin/users/' + encodeId(id), 'DELETE');
  },
};
