export const DEMO_STORAGE_KEY = 'sewaskill-demo-v1';

const FINAL_STATUSES = ['selesai', 'direfund', 'dibatalkan'];
const CATEGORIES = ['desain', 'koding', 'video', 'konten', 'foto'];
const EDITABLE_ROLES = ['pencari', 'penyedia'];

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  let uniquePart;
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    uniquePart = globalThis.crypto.randomUUID();
  } else {
    uniquePart = Date.now() + '-' + Math.random().toString(36).slice(2);
  }
  return prefix + '-' + uniquePart;
}

function copyOf(value) {
  return structuredClone(value);
}

function cleanText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function isMissing(value) {
  return value === null || value === undefined;
}

function requiredText(value, label, minimum = 1) {
  const result = cleanText(value);
  if (result.length < minimum) {
    let message = label + ' wajib diisi';
    if (minimum > 1) {
      message = message + ', minimal ' + minimum + ' karakter';
    }
    throw new Error(message + '.');
  }
  return result;
}

function validEmail(value) {
  const result = cleanText(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) {
    throw new Error('Isi alamat email yang valid.');
  }
  return result;
}

function validPassword(value) {
  let result = '';
  if (!isMissing(value)) {
    result = String(value);
  }
  if (result.length < 6 || !result.trim()) {
    throw new Error('Password minimal 6 karakter.');
  }
  return result;
}

function validMoney(value, label, allowZero = false) {
  const result = Number(value);
  let smallest = 1;
  if (allowZero) {
    smallest = 0;
  }
  if (!Number.isSafeInteger(result) || result < smallest || result > 1000000000) {
    throw new Error(label + ' harus berupa nominal rupiah yang valid.');
  }
  return result;
}

function validUrl(value, label, optional = true, allowInternalPath = false) {
  const result = cleanText(value);
  if (!result && optional) {
    return '';
  }
  if (allowInternalPath && result.startsWith('/') && !result.startsWith('//')) {
    return result;
  }
  try {
    const url = new URL(result);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error();
    }
    return url.href;
  } catch {
    throw new Error(label + ' harus berupa URL http atau https yang valid.');
  }
}

function findUser(state, id) {
  for (let index = 0; index < state.users.length; index++) {
    if (state.users[index].id === id) {
      return state.users[index];
    }
  }
  return null;
}

function findService(state, id) {
  for (let index = 0; index < state.services.length; index++) {
    if (state.services[index].id === id) {
      return state.services[index];
    }
  }
  return null;
}

function findReview(state, id) {
  for (let index = 0; index < state.reviews.length; index++) {
    if (state.reviews[index].id === id) {
      return state.reviews[index];
    }
  }
  return null;
}

function findOrder(state, id) {
  for (let index = 0; index < state.orders.length; index++) {
    if (state.orders[index].id === String(id)) {
      return state.orders[index];
    }
  }
  throw new Error('Pesanan tidak ditemukan.');
}

function emailExists(state, email, exceptUserId) {
  for (let index = 0; index < state.users.length; index++) {
    const user = state.users[index];
    if (user.id !== exceptUserId && user.email.toLowerCase() === email) {
      return true;
    }
  }
  return false;
}

function getActor(state, allowedRoles) {
  const user = findUser(state, state.currentUserId);
  if (!user) {
    throw new Error('Masuk terlebih dahulu untuk melanjutkan.');
  }
  if (user.status !== 'aktif') {
    throw new Error('Akun Anda diblokir.');
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Akun ini tidak memiliki akses untuk tindakan tersebut.');
  }
  return user;
}

function addLog(state, user, action, details) {
  let actorId = null;
  if (user) {
    actorId = user.id;
  }
  state.logs.unshift({
    id: createId('log'),
    actorId: actorId,
    action: action,
    details: details,
    createdAt: nowIso(),
  });
  state.logs = state.logs.slice(0, 500);
}

function hasUnfinishedOrder(state, userId) {
  for (let index = 0; index < state.orders.length; index++) {
    const order = state.orders[index];
    const isParticipant = order.buyerId === userId || order.sellerId === userId;
    if (isParticipant && !FINAL_STATUSES.includes(order.status)) {
      return true;
    }
  }
  return false;
}

function getAvailableService(state, id) {
  const service = findService(state, String(id));
  let owner = null;
  if (service) {
    owner = findUser(state, service.ownerId);
  }
  if (!service || service.hidden || !owner || owner.status !== 'aktif' || owner.role !== 'penyedia') {
    throw new Error('Jasa ini sedang tidak tersedia.');
  }
  return service;
}

function removeServiceData(state, serviceId) {
  const remainingServices = [];
  for (let index = 0; index < state.services.length; index++) {
    if (state.services[index].id !== serviceId) {
      remainingServices.push(state.services[index]);
    }
  }
  state.services = remainingServices;

  const remainingReviews = [];
  for (let index = 0; index < state.reviews.length; index++) {
    if (state.reviews[index].serviceId !== serviceId) {
      remainingReviews.push(state.reviews[index]);
    }
  }
  state.reviews = remainingReviews;

  const collections = [state.favorites, state.recent];
  for (let c = 0; c < collections.length; c++) {
    const collection = collections[c];
    const userIds = Object.keys(collection);
    for (let u = 0; u < userIds.length; u++) {
      const kept = [];
      const list = collection[userIds[u]];
      for (let i = 0; i < list.length; i++) {
        if (list[i] !== serviceId) {
          kept.push(list[i]);
        }
      }
      collection[userIds[u]] = kept;
    }
  }
}

function removeAccountData(state, userId) {
  if (hasUnfinishedOrder(state, userId)) {
    throw new Error('Akun masih memiliki pesanan yang belum selesai.');
  }

  const ownedServiceIds = [];
  for (let index = 0; index < state.services.length; index++) {
    if (state.services[index].ownerId === userId) {
      ownedServiceIds.push(state.services[index].id);
    }
  }
  for (let index = 0; index < ownedServiceIds.length; index++) {
    removeServiceData(state, ownedServiceIds[index]);
  }

  const remainingReviews = [];
  for (let index = 0; index < state.reviews.length; index++) {
    if (state.reviews[index].userId !== userId) {
      remainingReviews.push(state.reviews[index]);
    }
  }
  state.reviews = remainingReviews;

  const remainingUsers = [];
  for (let index = 0; index < state.users.length; index++) {
    if (state.users[index].id !== userId) {
      remainingUsers.push(state.users[index]);
    }
  }
  state.users = remainingUsers;

  delete state.favorites[userId];
  delete state.recent[userId];
  if (state.currentUserId === userId) {
    state.currentUserId = null;
  }
}

function updateOwnedServiceLocations(state, user) {
  for (let index = 0; index < state.services.length; index++) {
    if (state.services[index].ownerId === user.id) {
      state.services[index].location = user.location;
    }
  }
}

function prepareSeed(seed) {
  let valid = true;
  if (!seed || seed.version !== 1) {
    valid = false;
  } else {
    const requiredLists = ['users', 'services', 'orders', 'reviews', 'logs'];
    for (let index = 0; index < requiredLists.length; index++) {
      if (!Array.isArray(seed[requiredLists[index]])) {
        valid = false;
      }
    }
  }
  if (!valid) {
    throw new Error('Format data demo tidak valid.');
  }

  const result = copyOf(seed);
  if (isMissing(result.currentUserId)) {
    result.currentUserId = null;
  }
  if (isMissing(result.favorites)) {
    result.favorites = {};
  }
  if (isMissing(result.recent)) {
    result.recent = {};
  }

  const currentUser = findUser(result, result.currentUserId);
  if (!currentUser || currentUser.status !== 'aktif') {
    result.currentUserId = null;
  }
  return result;
}

function emptyState() {
  return {
    version: 1,
    currentUserId: null,
    users: [],
    services: [],
    orders: [],
    reviews: [],
    favorites: {},
    recent: {},
    logs: [],
  };
}

export function createDemoEngine(initialState) {
  const listeners = [];
  let snapshot = {
    state: emptyState(),
    ready: false,
    error: null,
  };

  function publish(nextSnapshot) {
    snapshot = nextSnapshot;
    const currentListeners = listeners.slice();
    for (let index = 0; index < currentListeners.length; index++) {
      currentListeners[index]();
    }
  }

  function startChange() {
    if (!snapshot.ready) {
      throw new Error('Data demo sedang dimuat.');
    }
    return copyOf(snapshot.state);
  }

  function commitChange(state) {
    publish({ state: state, ready: true, error: null });
  }

  const engine = {
    subscribe(listener) {
      listeners.push(listener);
      return function unsubscribe() {
        const position = listeners.indexOf(listener);
        if (position !== -1) {
          listeners.splice(position, 1);
        }
      };
    },

    getSnapshot() {
      return snapshot;
    },

    initialize(seed) {
      publish({ state: prepareSeed(seed), ready: true, error: null });
    },

    fail(error) {
      let message;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }
      publish({ state: snapshot.state, ready: false, error: message });
    },

    login(email, password) {
      const wantedEmail = cleanText(email).toLowerCase();
      let candidate = null;
      for (let index = 0; index < snapshot.state.users.length; index++) {
        const user = snapshot.state.users[index];
        if (user.email.toLowerCase() === wantedEmail) {
          candidate = user;
          break;
        }
      }
      if (!snapshot.ready) {
        throw new Error('Data demo sedang dimuat.');
      }
      if (!candidate || candidate.password !== password) {
        throw new Error('Email atau password salah.');
      }
      if (candidate.status !== 'aktif') {
        const blockedState = startChange();
        blockedState.currentUserId = null;
        addLog(
          blockedState,
          candidate,
          'login_ditolak',
          'Login akun diblokir ditolak: ' + candidate.name + '.',
        );
        commitChange(blockedState);
        throw new Error('Akun Anda diblokir.');
      }

      const state = startChange();
      state.currentUserId = candidate.id;
      addLog(state, candidate, 'login', candidate.name + ' masuk sebagai ' + candidate.role + '.');
      const loggedInUser = findUser(state, candidate.id);
      commitChange(state);
      return copyOf(loggedInUser);
    },

    register(draft) {
      const state = startChange();
      const email = validEmail(draft.email);
      const password = validPassword(draft.password);
      if (emailExists(state, email, null)) {
        throw new Error('Email sudah dipakai.');
      }
      const user = {
        id: createId('user'),
        name: requiredText(draft.name, 'Nama', 2),
        email: email,
        password: password,
        location: requiredText(draft.location, 'Lokasi', 2),
        role: 'pencari',
        status: 'aktif',
        balance: 500000,
        createdAt: nowIso(),
      };
      state.users.push(user);
      state.currentUserId = user.id;
      addLog(state, user, 'register', user.name + ' membuat akun pencari.');
      commitChange(state);
      return copyOf(user);
    },

    logout() {
      const state = startChange();
      const user = findUser(state, state.currentUserId);
      if (user) {
        addLog(state, user, 'logout', user.name + ' keluar.');
      }
      state.currentUserId = null;
      commitChange(state);
    },

    updateProfile(draft) {
      const state = startChange();
      const user = getActor(state);
      user.name = requiredText(draft.name, 'Nama', 2);
      user.location = requiredText(draft.location, 'Lokasi', 2);
      updateOwnedServiceLocations(state, user);
      addLog(state, user, 'profil_diperbarui', user.name + ' memperbarui profil.');
      commitChange(state);
      return copyOf(user);
    },

    becomeProvider(draft = {}) {
      const state = startChange();
      const user = getActor(state, ['pencari']);
      if (draft.location !== undefined) {
        user.location = requiredText(draft.location, 'Lokasi', 2);
      }
      user.skills = cleanText(draft.skills);
      user.experience = cleanText(draft.experience);
      user.role = 'penyedia';
      addLog(state, user, 'daftar_penyedia', user.name + ' mendaftar sebagai penyedia.');
      commitChange(state);
      return copyOf(user);
    },

    deleteAccount() {
      const state = startChange();
      const user = getActor(state, ['pencari', 'penyedia']);
      removeAccountData(state, user.id);
      addLog(state, user, 'hapus_akun_sendiri', user.name + ' menghapus akun sendiri.');
      commitChange(state);
    },

    toggleFavorite(serviceId) {
      const state = startChange();
      const user = getActor(state, ['pencari', 'penyedia']);
      const service = getAvailableService(state, serviceId);
      let favorites = state.favorites[user.id];
      if (!favorites) {
        favorites = [];
      }
      const alreadyFavorite = favorites.includes(service.id);
      if (alreadyFavorite) {
        const remaining = [];
        for (let index = 0; index < favorites.length; index++) {
          if (favorites[index] !== service.id) {
            remaining.push(favorites[index]);
          }
        }
        state.favorites[user.id] = remaining;
      } else {
        state.favorites[user.id] = favorites.concat([service.id]);
      }
      commitChange(state);
      return !alreadyFavorite;
    },

    viewService(serviceId) {
      if (!snapshot.state.currentUserId) {
        return;
      }
      const state = startChange();
      const user = getActor(state, ['pencari', 'penyedia']);
      const service = getAvailableService(state, serviceId);
      let previous = state.recent[user.id];
      if (!previous) {
        previous = [];
      }
      const recentIds = [service.id];
      for (let index = 0; index < previous.length; index++) {
        if (previous[index] !== service.id) {
          recentIds.push(previous[index]);
        }
      }
      state.recent[user.id] = recentIds.slice(0, 12);
      commitChange(state);
    },

    saveService(draft) {
      const state = startChange();
      const user = getActor(state, ['penyedia']);

      let existing = null;
      if (draft.id) {
        existing = findService(state, String(draft.id));
      }
      if (draft.id && !existing) {
        throw new Error('Jasa tidak ditemukan.');
      }
      if (existing && existing.ownerId !== user.id) {
        throw new Error('Hanya pemilik jasa yang dapat mengubahnya.');
      }

      const category = cleanText(draft.category);
      if (!CATEGORIES.includes(category)) {
        throw new Error('Pilih kategori jasa yang valid.');
      }
      if (!Array.isArray(draft.packages) || draft.packages.length === 0) {
        throw new Error('Tambahkan minimal satu paket layanan.');
      }

      const packages = [];
      for (let index = 0; index < draft.packages.length; index++) {
        const item = draft.packages[index];
        let packageId = cleanText(item.id);
        if (!packageId) {
          packageId = createId('package');
        }
        packages.push({
          id: packageId,
          name: requiredText(item.name, 'Nama paket'),
          description: cleanText(item.description),
          price: validMoney(item.price, 'Harga paket'),
        });
      }

      const packageNames = [];
      const packageIds = [];
      for (let index = 0; index < packages.length; index++) {
        const lowerName = packages[index].name.toLowerCase();
        if (!packageNames.includes(lowerName)) {
          packageNames.push(lowerName);
        }
        if (!packageIds.includes(packages[index].id)) {
          packageIds.push(packages[index].id);
        }
      }
      if (packageNames.length !== packages.length) {
        throw new Error('Nama paket tidak boleh sama.');
      }
      if (packageIds.length !== packages.length) {
        throw new Error('ID paket tidak boleh sama.');
      }

      const days = Number(draft.days);
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        throw new Error('Waktu pengerjaan harus antara 1 dan 365 hari.');
      }

      let imageSource = draft.image;
      if (!imageSource && existing && existing.image) {
        imageSource = existing.image;
      }
      if (!imageSource) {
        imageSource = '/assets/images/studio-website.webp';
      }

      let serviceId = createId('service');
      let hidden = false;
      let createdAt = nowIso();
      if (existing) {
        serviceId = existing.id;
        if (!isMissing(existing.hidden)) {
          hidden = existing.hidden;
        }
        if (!isMissing(existing.createdAt)) {
          createdAt = existing.createdAt;
        }
      }

      const service = {
        id: serviceId,
        ownerId: user.id,
        title: requiredText(draft.title, 'Judul jasa', 3),
        category: category,
        description: requiredText(draft.description, 'Deskripsi', 10),
        location: user.location,
        days: days,
        portfolioUrl: validUrl(draft.portfolioUrl, 'Link portofolio'),
        image: validUrl(imageSource, 'Gambar jasa', false, true),
        packages: packages,
        hidden: hidden,
        createdAt: createdAt,
        updatedAt: nowIso(),
      };

      if (existing) {
        state.services[state.services.indexOf(existing)] = service;
        addLog(
          state,
          user,
          'jasa_diperbarui',
          user.name + ' memperbarui jasa ' + service.title + '.',
        );
      } else {
        state.services.unshift(service);
        addLog(
          state,
          user,
          'jasa_ditambahkan',
          user.name + ' menambahkan jasa ' + service.title + '.',
        );
      }
      commitChange(state);
      return copyOf(service);
    },

    deleteService(id) {
      const state = startChange();
      const user = getActor(state, ['penyedia', 'admin']);
      const service = findService(state, String(id));
      if (!service) {
        throw new Error('Jasa tidak ditemukan.');
      }
      if (user.role !== 'admin' && service.ownerId !== user.id) {
        throw new Error('Hanya pemilik jasa yang dapat menghapusnya.');
      }
      for (let index = 0; index < state.orders.length; index++) {
        const order = state.orders[index];
        if (order.serviceId === service.id && !FINAL_STATUSES.includes(order.status)) {
          throw new Error('Jasa masih memiliki pesanan yang belum selesai.');
        }
      }
      removeServiceData(state, service.id);
      addLog(state, user, 'jasa_dihapus', user.name + ' menghapus jasa ' + service.title + '.');
      commitChange(state);
    },

    saveReview(draft) {
      const state = startChange();
      const user = getActor(state, ['pencari']);
      const service = getAvailableService(state, draft.serviceId);

      let existing = null;
      if (draft.id) {
        existing = findReview(state, String(draft.id));
        if (!existing || existing.userId !== user.id || existing.serviceId !== service.id) {
          throw new Error('Ulasan bukan milik Anda.');
        }
      }

      const rating = Number(draft.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Pilih rating 1 sampai 5.');
      }
      if (service.ownerId === user.id) {
        throw new Error('Anda tidak dapat mengulas jasa sendiri.');
      }
      if (!existing) {
        for (let index = 0; index < state.reviews.length; index++) {
          const other = state.reviews[index];
          if (other.serviceId === service.id && other.userId === user.id) {
            throw new Error('Anda sudah mengulas jasa ini. Edit ulasan yang sudah ada.');
          }
        }
      }

      let reviewId = createId('review');
      let createdAt = nowIso();
      if (existing) {
        reviewId = existing.id;
        if (!isMissing(existing.createdAt)) {
          createdAt = existing.createdAt;
        }
      }

      const review = {
        id: reviewId,
        serviceId: service.id,
        userId: user.id,
        rating: rating,
        comment: requiredText(draft.comment, 'Komentar'),
        createdAt: createdAt,
        updatedAt: nowIso(),
      };

      if (existing) {
        state.reviews[state.reviews.indexOf(existing)] = review;
      } else {
        state.reviews.unshift(review);
      }
      addLog(
        state,
        user,
        'ulasan_disimpan',
        user.name + ' menyimpan ulasan untuk ' + service.title + '.',
      );
      commitChange(state);
      return copyOf(review);
    },

    deleteReview(id) {
      const state = startChange();
      const user = getActor(state, ['pencari']);
      const review = findReview(state, String(id));
      if (!review || review.userId !== user.id) {
        throw new Error('Ulasan bukan milik Anda.');
      }
      const remaining = [];
      for (let index = 0; index < state.reviews.length; index++) {
        if (state.reviews[index].id !== review.id) {
          remaining.push(state.reviews[index]);
        }
      }
      state.reviews = remaining;
      addLog(state, user, 'ulasan_dihapus', user.name + ' menghapus ulasan.');
      commitChange(state);
    },

    createOrder(draft) {
      const state = startChange();
      const user = getActor(state, ['pencari']);
      const service = getAvailableService(state, draft.serviceId);
      if (service.ownerId === user.id) {
        throw new Error('Anda tidak dapat memesan jasa sendiri.');
      }

      let selected = null;
      for (let index = 0; index < service.packages.length; index++) {
        if (service.packages[index].id === String(draft.packageId)) {
          selected = service.packages[index];
          break;
        }
      }
      if (!selected) {
        throw new Error('Pilih paket layanan yang tersedia.');
      }

      const brief = requiredText(draft.brief, 'Brief proyek', 5);
      const fee = Math.round(selected.price * 0.05);
      const paymentMethod = requiredText(draft.paymentMethod, 'Metode pembayaran');

      let buyerName = cleanText(draft.buyerName);
      if (!buyerName) {
        buyerName = user.name;
      }

      let email = user.email;
      if (draft.email) {
        email = validEmail(draft.email);
      }

      const attachments = [];
      if (Array.isArray(draft.attachments)) {
        for (let index = 0; index < draft.attachments.length; index++) {
          const item = draft.attachments[index];
          attachments.push({
            name: cleanText(item.name),
            size: Number(item.size) || 0,
          });
        }
      }

      const order = {
        id: createId('ORDER'),
        buyerId: user.id,
        sellerId: service.ownerId,
        serviceId: service.id,
        serviceTitle: service.title,
        packageId: selected.id,
        packageName: selected.name,
        price: selected.price,
        fee: fee,
        total: selected.price + fee,
        status: 'menunggu_pembayaran',
        brief: brief,
        deadline: cleanText(draft.deadline),
        paymentMethod: paymentMethod,
        buyerName: buyerName,
        email: email,
        whatsapp: cleanText(draft.whatsapp),
        attachments: attachments,
        resultUrl: '',
        complaint: '',
        decision: '',
        hiddenForBuyer: false,
        createdAt: nowIso(),
      };

      state.orders.unshift(order);
      addLog(state, user, 'order_dibuat', user.name + ' membuat pesanan ' + order.id + '.');
      commitChange(state);
      return copyOf(order);
    },

    payOrder(id, success = true) {
      const state = startChange();
      if (typeof success !== 'boolean') {
        throw new Error('Hasil simulasi pembayaran tidak valid.');
      }
      const user = getActor(state, ['pencari', 'penyedia']);
      const order = findOrder(state, id);
      if (order.buyerId !== user.id || order.status !== 'menunggu_pembayaran') {
        throw new Error('Pesanan ini tidak dapat dibayar.');
      }
      const seller = findUser(state, order.sellerId);
      if (!seller || seller.status !== 'aktif' || seller.role !== 'penyedia') {
        throw new Error('Penyedia jasa sedang tidak tersedia.');
      }

      if (success) {
        if (user.balance < order.total) {
          throw new Error('Saldo demo tidak cukup untuk pembayaran ini.');
        }
        user.balance = user.balance - order.total;
        order.status = 'dibayar';
        order.paidAt = nowIso();
      }
      order.paymentAttemptAt = nowIso();

      if (success) {
        order.paymentResult = 'berhasil';
        addLog(
          state,
          user,
          'pembayaran_berhasil',
          'Simulasi pembayaran ' + order.id + ' berhasil.',
        );
      } else {
        order.paymentResult = 'gagal';
        addLog(state, user, 'pembayaran_gagal', 'Simulasi pembayaran ' + order.id + ' gagal.');
      }
      commitChange(state);
      return copyOf(order);
    },

    cancelOrder(id) {
      const state = startChange();
      const user = getActor(state, ['pencari', 'penyedia']);
      const order = findOrder(state, id);
      if (order.buyerId !== user.id || order.status !== 'menunggu_pembayaran') {
        throw new Error('Hanya pesanan yang belum dibayar dapat dibatalkan.');
      }
      order.status = 'dibatalkan';
      order.closedAt = nowIso();
      addLog(state, user, 'order_dibatalkan', user.name + ' membatalkan ' + order.id + '.');
      commitChange(state);
      return copyOf(order);
    },

    deliverOrder(id, resultUrl) {
      const state = startChange();
      const user = getActor(state, ['penyedia']);
      const order = findOrder(state, id);
      if (order.sellerId !== user.id || order.status !== 'dibayar') {
        throw new Error('Hasil hanya dapat dikirim untuk pesanan milik Anda yang sudah dibayar.');
      }
      order.resultUrl = requiredText(resultUrl, 'Hasil pekerjaan', 3);
      if (/^[a-z][a-z\d+.-]*:/i.test(order.resultUrl)) {
        order.resultUrl = validUrl(order.resultUrl, 'Link hasil', false);
      }
      order.status = 'dikirim';
      order.deliveredAt = nowIso();
      addLog(state, user, 'hasil_dikirim', user.name + ' mengirim hasil ' + order.id + '.');
      commitChange(state);
      return copyOf(order);
    },

    acceptOrder(id) {
      return engine.decideOrder(id, true, '');
    },

    complainOrder(id, complaint) {
      return engine.decideOrder(id, false, complaint);
    },

    decideOrder(id, accepted, complaint) {
      const state = startChange();
      if (typeof accepted !== 'boolean') {
        throw new Error('Keputusan pembeli tidak valid.');
      }
      const user = getActor(state, ['pencari', 'penyedia']);
      const order = findOrder(state, id);
      if (order.buyerId !== user.id || order.status !== 'dikirim') {
        throw new Error('Pesanan belum dapat ditinjau oleh pembeli.');
      }
      if (accepted) {
        order.complaint = '';
        order.decision = 'diterima';
      } else {
        order.complaint = requiredText(complaint, 'Alasan komplain', 3);
        order.decision = 'komplain';
      }
      order.status = 'menunggu_admin';
      order.reviewedByBuyerAt = nowIso();
      if (accepted) {
        addLog(state, user, 'hasil_diterima', user.name + ' menerima hasil ' + order.id + '.');
      } else {
        addLog(state, user, 'komplain', user.name + ' mengajukan komplain ' + order.id + '.');
      }
      commitChange(state);
      return copyOf(order);
    },

    deleteOrder(id) {
      const state = startChange();
      const user = getActor(state, ['pencari', 'penyedia']);
      const order = findOrder(state, id);
      if (order.buyerId !== user.id || !FINAL_STATUSES.includes(order.status)) {
        throw new Error('Hanya riwayat pesanan akhir milik pembeli yang dapat dihapus.');
      }
      order.hiddenForBuyer = true;
      addLog(
        state,
        user,
        'riwayat_dihapus',
        user.name + ' menyembunyikan riwayat ' + order.id + '.',
      );
      commitChange(state);
    },

    reviewOrder(id, approve) {
      const state = startChange();
      const admin = getActor(state, ['admin']);
      const order = findOrder(state, id);
      if (order.status !== 'menunggu_admin') {
        throw new Error('Pesanan ini sudah diputuskan atau belum menunggu admin.');
      }
      if (typeof approve !== 'boolean') {
        throw new Error('Pilih keputusan admin yang valid.');
      }

      let target;
      if (approve) {
        target = findUser(state, order.sellerId);
      } else {
        target = findUser(state, order.buyerId);
      }
      if (!target) {
        throw new Error('Akun penerima saldo tidak ditemukan.');
      }

      if (approve) {
        target.balance = target.balance + order.price;
        order.status = 'selesai';
      } else {
        target.balance = target.balance + order.total;
        order.status = 'direfund';
      }
      order.closedAt = nowIso();
      order.adminId = admin.id;

      if (approve) {
        addLog(state, admin, 'order_disetujui', 'Admin menyetujui ' + order.id + '.');
      } else {
        addLog(state, admin, 'order_direfund', 'Admin mengembalikan pembayaran ' + order.id + '.');
      }
      commitChange(state);
      return copyOf(order);
    },

    saveUser(draft) {
      const state = startChange();
      const admin = getActor(state, ['admin']);

      let existing = null;
      if (draft.id) {
        existing = findUser(state, String(draft.id));
      }
      if (draft.id && !existing) {
        throw new Error('Akun tidak ditemukan.');
      }
      if (existing && (existing.id === admin.id || existing.role === 'admin')) {
        throw new Error('Akun admin tidak dapat diubah melalui manajemen akun.');
      }

      let role = draft.role;
      if (!role && existing) {
        role = existing.role;
      }
      if (!role) {
        role = 'pencari';
      }
      role = cleanText(role);

      let status = draft.status;
      if (!status && existing) {
        status = existing.status;
      }
      if (!status) {
        status = 'aktif';
      }
      status = cleanText(status);

      if (!EDITABLE_ROLES.includes(role)) {
        throw new Error('Role harus pencari atau penyedia.');
      }
      if (status !== 'aktif' && status !== 'diblokir') {
        throw new Error('Status akun tidak valid.');
      }
      if (existing && role !== existing.role && hasUnfinishedOrder(state, existing.id)) {
        throw new Error('Role akun dengan pesanan aktif belum dapat diubah.');
      }

      let emailInput = draft.email;
      if (isMissing(emailInput) && existing) {
        emailInput = existing.email;
      }
      const email = validEmail(emailInput);
      let existingId = null;
      if (existing) {
        existingId = existing.id;
      }
      if (emailExists(state, email, existingId)) {
        throw new Error('Email sudah dipakai.');
      }

      let password;
      if (draft.password) {
        password = validPassword(draft.password);
      } else if (existing) {
        password = existing.password;
      }
      if (!password) {
        throw new Error('Password minimal 6 karakter.');
      }

      let nameInput = draft.name;
      if (isMissing(nameInput) && existing) {
        nameInput = existing.name;
      }
      let locationInput = draft.location;
      if (isMissing(locationInput) && existing) {
        locationInput = existing.location;
      }
      let balanceInput = draft.balance;
      if (isMissing(balanceInput)) {
        if (existing && !isMissing(existing.balance)) {
          balanceInput = existing.balance;
        } else if (role === 'pencari') {
          balanceInput = 500000;
        } else {
          balanceInput = 0;
        }
      }

      const user = {};
      if (existing) {
        Object.assign(user, existing);
        if (isMissing(existing.createdAt)) {
          user.createdAt = nowIso();
        }
      } else {
        user.id = createId('user');
        user.createdAt = nowIso();
      }
      user.name = requiredText(nameInput, 'Nama', 2);
      user.email = email;
      user.password = password;
      user.location = requiredText(locationInput, 'Lokasi', 2);
      user.role = role;
      user.status = status;
      user.balance = validMoney(balanceInput, 'Saldo demo', true);

      if (existing) {
        state.users[state.users.indexOf(existing)] = user;
      } else {
        state.users.push(user);
      }
      updateOwnedServiceLocations(state, user);

      if (existing) {
        addLog(
          state,
          admin,
          'akun_diperbarui',
          'Admin memperbarui akun ' + user.name + ': ' + role + ', ' + status + '.',
        );
      } else {
        addLog(
          state,
          admin,
          'akun_ditambahkan',
          'Admin menambahkan akun ' + user.name + ': ' + role + ', ' + status + '.',
        );
      }
      commitChange(state);
      return copyOf(user);
    },

    deleteUser(id) {
      const state = startChange();
      const admin = getActor(state, ['admin']);
      const user = findUser(state, String(id));
      if (!user || user.id === admin.id || user.role === 'admin') {
        throw new Error('Akun admin tidak dapat dihapus.');
      }
      removeAccountData(state, user.id);
      addLog(state, admin, 'akun_dihapus', 'Admin menghapus akun ' + user.name + '.');
      commitChange(state);
    },

    moderateService(id, hidden) {
      const state = startChange();
      const admin = getActor(state, ['admin']);
      const service = findService(state, String(id));
      if (!service) {
        throw new Error('Jasa tidak ditemukan.');
      }
      if (typeof hidden !== 'boolean') {
        throw new Error('Status moderasi tidak valid.');
      }
      service.hidden = hidden;
      if (hidden) {
        addLog(
          state,
          admin,
          'jasa_disembunyikan',
          'Admin menyembunyikan jasa ' + service.title + '.',
        );
      } else {
        addLog(state, admin, 'jasa_ditampilkan', 'Admin menampilkan jasa ' + service.title + '.');
      }
      commitChange(state);
      return copyOf(service);
    },
  };

  if (initialState) {
    engine.initialize(initialState);
  }
  return engine;
}
