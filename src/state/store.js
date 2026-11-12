import seed from '../data/demo.json';
import {
  CATEGORIES,
  FINAL_STATUSES,
  email as checkEmail,
  flag,
  money,
  newId,
  password as checkPassword,
  required,
  text,
  url,
} from './validators';

const STORAGE_KEY = 'sewaskill-data-v2';
const START_BALANCE = 500000;

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.warn('Data tersimpan tidak terbaca, memakai data awal.');
  }
  return structuredClone(seed);
}

let state = loadSaved();
const listeners = new Set();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('localStorage tidak tersedia, data hanya bertahan selama tab terbuka.');
  }
}

save();

function change(work) {
  const next = structuredClone(state);
  const result = work(next);
  state = next;
  save();
  listeners.forEach((listener) => listener());
  return result;
}

function byId(list, id) {
  return list.find((item) => item.id === String(id));
}

function addLog(s, user, action, details) {
  s.logs.unshift({
    id: newId('log'),
    actorId: user ? user.id : null,
    action,
    details,
    createdAt: new Date().toISOString(),
  });
  s.logs = s.logs.slice(0, 500);
}

function actor(s, roles) {
  const user = byId(s.users, s.currentUserId);
  if (!user) {
    throw new Error('Masuk terlebih dahulu untuk melanjutkan.');
  }
  if (user.status !== 'aktif') {
    throw new Error('Akun Anda diblokir.');
  }
  if (roles && !roles.includes(user.role)) {
    throw new Error('Akun ini tidak memiliki akses untuk tindakan tersebut.');
  }
  return user;
}

function openService(s, id) {
  const service = byId(s.services, id);
  const owner = service && byId(s.users, service.ownerId);
  if (!service || service.hidden || !owner || owner.status !== 'aktif' || owner.role !== 'penyedia') {
    throw new Error('Jasa ini sedang tidak tersedia.');
  }
  return service;
}

function findOrder(s, id) {
  const order = byId(s.orders, id);
  if (!order) {
    throw new Error('Pesanan tidak ditemukan.');
  }
  return order;
}

function hasOpenOrder(s, userId) {
  return s.orders.some(
    (o) => (o.buyerId === userId || o.sellerId === userId) && !FINAL_STATUSES.includes(o.status),
  );
}

function emailTaken(s, address, exceptId) {
  return s.users.some((u) => u.id !== exceptId && u.email.toLowerCase() === address);
}

function dropService(s, serviceId) {
  s.services = s.services.filter((x) => x.id !== serviceId);
  s.reviews = s.reviews.filter((r) => r.serviceId !== serviceId);
  for (const list of [s.favorites, s.recent]) {
    for (const userId of Object.keys(list)) {
      list[userId] = list[userId].filter((id) => id !== serviceId);
    }
  }
}

function dropUser(s, userId) {
  if (hasOpenOrder(s, userId)) {
    throw new Error('Akun masih memiliki pesanan yang belum selesai.');
  }
  s.services.filter((x) => x.ownerId === userId).forEach((x) => dropService(s, x.id));
  s.reviews = s.reviews.filter((r) => r.userId !== userId);
  s.users = s.users.filter((u) => u.id !== userId);
  delete s.favorites[userId];
  delete s.recent[userId];
  if (s.currentUserId === userId) {
    s.currentUserId = null;
  }
}

function syncLocations(s, user) {
  s.services.filter((x) => x.ownerId === user.id).forEach((x) => (x.location = user.location));
}

function parsePackages(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('Tambahkan minimal satu paket layanan.');
  }
  const packages = list.map((item) => ({
    id: text(item.id) || newId('package'),
    name: required(item.name, 'Nama paket'),
    description: text(item.description),
    price: money(item.price, 'Harga paket'),
  }));
  if (new Set(packages.map((p) => p.name.toLowerCase())).size !== packages.length) {
    throw new Error('Nama paket tidak boleh sama.');
  }
  if (new Set(packages.map((p) => p.id)).size !== packages.length) {
    throw new Error('ID paket tidak boleh sama.');
  }
  return packages;
}

function decide(id, accepted, complaint) {
  flag(accepted, 'Keputusan pembeli tidak valid.');
  return change((s) => {
    const user = actor(s, ['pencari', 'penyedia']);
    const order = findOrder(s, id);
    if (order.buyerId !== user.id || order.status !== 'dikirim') {
      throw new Error('Pesanan belum dapat ditinjau oleh pembeli.');
    }
    order.complaint = accepted ? '' : required(complaint, 'Alasan komplain', 3);
    order.decision = accepted ? 'diterima' : 'komplain';
    order.status = 'menunggu_admin';
    order.reviewedByBuyerAt = new Date().toISOString();
    if (accepted) {
      addLog(s, user, 'hasil_diterima', user.name + ' menerima hasil ' + order.id + '.');
    } else {
      addLog(s, user, 'komplain', user.name + ' mengajukan komplain ' + order.id + '.');
    }
    return order;
  });
}

export const store = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return state;
  },

  reset() {
    state = structuredClone(seed);
    save();
    listeners.forEach((listener) => listener());
  },

  login(emailInput, passwordInput) {
    const address = text(emailInput).toLowerCase();
    return change((s) => {
      const user = s.users.find((u) => u.email.toLowerCase() === address);
      if (!user || user.password !== passwordInput) {
        throw new Error('Email atau password salah.');
      }
      if (user.status !== 'aktif') {
        throw new Error('Akun Anda diblokir.');
      }
      s.currentUserId = user.id;
      addLog(s, user, 'login', user.name + ' masuk sebagai ' + user.role + '.');
      return user;
    });
  },

  register(draft) {
    return change((s) => {
      const address = checkEmail(draft.email);
      const pass = checkPassword(draft.password);
      if (emailTaken(s, address, null)) {
        throw new Error('Email sudah dipakai.');
      }
      const user = {
        id: newId('user'),
        name: required(draft.name, 'Nama', 2),
        email: address,
        password: pass,
        location: required(draft.location, 'Lokasi', 2),
        role: 'pencari',
        status: 'aktif',
        balance: START_BALANCE,
        createdAt: new Date().toISOString(),
      };
      s.users.push(user);
      s.currentUserId = user.id;
      addLog(s, user, 'register', user.name + ' membuat akun pencari.');
      return user;
    });
  },

  logout() {
    change((s) => {
      const user = byId(s.users, s.currentUserId);
      if (user) {
        addLog(s, user, 'logout', user.name + ' keluar.');
      }
      s.currentUserId = null;
    });
  },

  updateProfile(draft) {
    return change((s) => {
      const user = actor(s);
      user.name = required(draft.name, 'Nama', 2);
      user.location = required(draft.location, 'Lokasi', 2);
      syncLocations(s, user);
      addLog(s, user, 'profil_diperbarui', user.name + ' memperbarui profil.');
      return user;
    });
  },

  becomeProvider(draft = {}) {
    return change((s) => {
      const user = actor(s, ['pencari']);
      if (draft.location !== undefined) {
        user.location = required(draft.location, 'Lokasi', 2);
      }
      user.skills = text(draft.skills);
      user.experience = text(draft.experience);
      user.role = 'penyedia';
      addLog(s, user, 'daftar_penyedia', user.name + ' mendaftar sebagai penyedia.');
      return user;
    });
  },

  deleteAccount() {
    change((s) => {
      const user = actor(s, ['pencari', 'penyedia']);
      dropUser(s, user.id);
      addLog(s, user, 'hapus_akun_sendiri', user.name + ' menghapus akun sendiri.');
    });
  },

  toggleFavorite(serviceId) {
    return change((s) => {
      const user = actor(s, ['pencari', 'penyedia']);
      const service = openService(s, serviceId);
      const list = s.favorites[user.id] || [];
      const already = list.includes(service.id);
      s.favorites[user.id] = already ? list.filter((id) => id !== service.id) : [...list, service.id];
      return !already;
    });
  },

  viewService(serviceId) {
    if (!state.currentUserId) {
      return;
    }
    change((s) => {
      const user = actor(s, ['pencari', 'penyedia']);
      const service = openService(s, serviceId);
      const previous = (s.recent[user.id] || []).filter((id) => id !== service.id);
      s.recent[user.id] = [service.id, ...previous].slice(0, 12);
    });
  },

  saveService(draft) {
    return change((s) => {
      const user = actor(s, ['penyedia']);
      const existing = draft.id ? byId(s.services, draft.id) : null;
      if (draft.id && !existing) {
        throw new Error('Jasa tidak ditemukan.');
      }
      if (existing && existing.ownerId !== user.id) {
        throw new Error('Hanya pemilik jasa yang dapat mengubahnya.');
      }
      const category = text(draft.category);
      if (!CATEGORIES.includes(category)) {
        throw new Error('Pilih kategori jasa yang valid.');
      }
      const packages = parsePackages(draft.packages);
      const days = Number(draft.days);
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        throw new Error('Waktu pengerjaan harus antara 1 dan 365 hari.');
      }
      const image =
        draft.image || (existing && existing.image) || '/assets/images/studio-website.webp';
      const now = new Date().toISOString();

      const service = {
        id: existing ? existing.id : newId('service'),
        ownerId: user.id,
        title: required(draft.title, 'Judul jasa', 3),
        category,
        description: required(draft.description, 'Deskripsi', 10),
        location: user.location,
        days,
        portfolioUrl: url(draft.portfolioUrl, 'Link portofolio'),
        image: url(image, 'Gambar jasa', false, true),
        packages,
        hidden: existing ? Boolean(existing.hidden) : false,
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      };

      if (existing) {
        s.services[s.services.indexOf(existing)] = service;
        addLog(s, user, 'jasa_diperbarui', user.name + ' memperbarui jasa ' + service.title + '.');
      } else {
        s.services.unshift(service);
        addLog(s, user, 'jasa_ditambahkan', user.name + ' menambahkan jasa ' + service.title + '.');
      }
      return service;
    });
  },

  deleteService(id) {
    change((s) => {
      const user = actor(s, ['penyedia', 'admin']);
      const service = byId(s.services, id);
      if (!service) {
        throw new Error('Jasa tidak ditemukan.');
      }
      if (user.role !== 'admin' && service.ownerId !== user.id) {
        throw new Error('Hanya pemilik jasa yang dapat menghapusnya.');
      }
      if (s.orders.some((o) => o.serviceId === service.id && !FINAL_STATUSES.includes(o.status))) {
        throw new Error('Jasa masih memiliki pesanan yang belum selesai.');
      }
      dropService(s, service.id);
      addLog(s, user, 'jasa_dihapus', user.name + ' menghapus jasa ' + service.title + '.');
    });
  },

  moderateService(id, hidden) {
    return change((s) => {
      const admin = actor(s, ['admin']);
      const service = byId(s.services, id);
      if (!service) {
        throw new Error('Jasa tidak ditemukan.');
      }
      service.hidden = flag(hidden, 'Status moderasi tidak valid.');
      const action = hidden ? 'jasa_disembunyikan' : 'jasa_ditampilkan';
      const verb = hidden ? 'menyembunyikan' : 'menampilkan';
      addLog(s, admin, action, 'Admin ' + verb + ' jasa ' + service.title + '.');
      return service;
    });
  },

  saveReview(draft) {
    return change((s) => {
      const user = actor(s, ['pencari']);
      const service = openService(s, draft.serviceId);
      const existing = draft.id ? byId(s.reviews, draft.id) : null;
      if (draft.id && (!existing || existing.userId !== user.id || existing.serviceId !== service.id)) {
        throw new Error('Ulasan bukan milik Anda.');
      }
      const rating = Number(draft.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Pilih rating 1 sampai 5.');
      }
      if (service.ownerId === user.id) {
        throw new Error('Anda tidak dapat mengulas jasa sendiri.');
      }
      if (!existing && s.reviews.some((r) => r.serviceId === service.id && r.userId === user.id)) {
        throw new Error('Anda sudah mengulas jasa ini. Edit ulasan yang sudah ada.');
      }
      const now = new Date().toISOString();
      const review = {
        id: existing ? existing.id : newId('review'),
        serviceId: service.id,
        userId: user.id,
        rating,
        comment: required(draft.comment, 'Komentar'),
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      };
      if (existing) {
        s.reviews[s.reviews.indexOf(existing)] = review;
      } else {
        s.reviews.unshift(review);
      }
      addLog(s, user, 'ulasan_disimpan', user.name + ' menyimpan ulasan untuk ' + service.title + '.');
      return review;
    });
  },

  deleteReview(id) {
    change((s) => {
      const user = actor(s, ['pencari']);
      const review = byId(s.reviews, id);
      if (!review || review.userId !== user.id) {
        throw new Error('Ulasan bukan milik Anda.');
      }
      s.reviews = s.reviews.filter((r) => r.id !== review.id);
      addLog(s, user, 'ulasan_dihapus', user.name + ' menghapus ulasan.');
    });
  },

  createOrder(draft) {
    return change((s) => {
      const user = actor(s, ['pencari']);
      const service = openService(s, draft.serviceId);
      if (service.ownerId === user.id) {
        throw new Error('Anda tidak dapat memesan jasa sendiri.');
      }
      const selected = service.packages.find((p) => p.id === String(draft.packageId));
      if (!selected) {
        throw new Error('Pilih paket layanan yang tersedia.');
      }
      const brief = required(draft.brief, 'Brief proyek', 5);
      const paymentMethod = required(draft.paymentMethod, 'Metode pembayaran');
      const fee = Math.round(selected.price * 0.05);
      const attachments = (Array.isArray(draft.attachments) ? draft.attachments : []).map((a) => ({
        name: text(a.name),
        size: Number(a.size) || 0,
      }));

      const order = {
        id: newId('ORDER'),
        buyerId: user.id,
        sellerId: service.ownerId,
        serviceId: service.id,
        serviceTitle: service.title,
        packageId: selected.id,
        packageName: selected.name,
        price: selected.price,
        fee,
        total: selected.price + fee,
        status: 'menunggu_pembayaran',
        brief,
        deadline: text(draft.deadline),
        paymentMethod,
        buyerName: text(draft.buyerName) || user.name,
        email: draft.email ? checkEmail(draft.email) : user.email,
        whatsapp: text(draft.whatsapp),
        attachments,
        resultUrl: '',
        complaint: '',
        decision: '',
        hiddenForBuyer: false,
        createdAt: new Date().toISOString(),
      };
      s.orders.unshift(order);
      addLog(s, user, 'order_dibuat', user.name + ' membuat pesanan ' + order.id + '.');
      return order;
    });
  },

  payOrder(id, success = true) {
    flag(success, 'Hasil simulasi pembayaran tidak valid.');
    return change((s) => {
      const user = actor(s, ['pencari', 'penyedia']);
      const order = findOrder(s, id);
      if (order.buyerId !== user.id || order.status !== 'menunggu_pembayaran') {
        throw new Error('Pesanan ini tidak dapat dibayar.');
      }
      const seller = byId(s.users, order.sellerId);
      if (!seller || seller.status !== 'aktif' || seller.role !== 'penyedia') {
        throw new Error('Penyedia jasa sedang tidak tersedia.');
      }
      const now = new Date().toISOString();
      order.paymentAttemptAt = now;
      if (success) {
        if (user.balance < order.total) {
          throw new Error('Saldo demo tidak cukup untuk pembayaran ini.');
        }
        user.balance -= order.total;
        order.status = 'dibayar';
        order.paidAt = now;
        order.paymentResult = 'berhasil';
        addLog(s, user, 'pembayaran_berhasil', 'Simulasi pembayaran ' + order.id + ' berhasil.');
      } else {
        order.paymentResult = 'gagal';
        addLog(s, user, 'pembayaran_gagal', 'Simulasi pembayaran ' + order.id + ' gagal.');
      }
      return order;
    });
  },

  cancelOrder(id) {
    return change((s) => {
      const user = actor(s, ['pencari', 'penyedia']);
      const order = findOrder(s, id);
      if (order.buyerId !== user.id || order.status !== 'menunggu_pembayaran') {
        throw new Error('Hanya pesanan yang belum dibayar dapat dibatalkan.');
      }
      order.status = 'dibatalkan';
      order.closedAt = new Date().toISOString();
      addLog(s, user, 'order_dibatalkan', user.name + ' membatalkan ' + order.id + '.');
      return order;
    });
  },

  deliverOrder(id, resultUrl) {
    return change((s) => {
      const user = actor(s, ['penyedia']);
      const order = findOrder(s, id);
      if (order.sellerId !== user.id || order.status !== 'dibayar') {
        throw new Error('Hasil hanya dapat dikirim untuk pesanan milik Anda yang sudah dibayar.');
      }
      let result = required(resultUrl, 'Hasil pekerjaan', 3);
      if (/^[a-z][a-z\d+.-]*:/i.test(result)) {
        result = url(result, 'Link hasil', false);
      }
      order.resultUrl = result;
      order.status = 'dikirim';
      order.deliveredAt = new Date().toISOString();
      addLog(s, user, 'hasil_dikirim', user.name + ' mengirim hasil ' + order.id + '.');
      return order;
    });
  },

  acceptOrder(id) {
    return decide(id, true, '');
  },

  complainOrder(id, complaint) {
    return decide(id, false, complaint);
  },

  deleteOrder(id) {
    change((s) => {
      const user = actor(s, ['pencari', 'penyedia']);
      const order = findOrder(s, id);
      if (order.buyerId !== user.id || !FINAL_STATUSES.includes(order.status)) {
        throw new Error('Hanya riwayat pesanan akhir milik pembeli yang dapat dihapus.');
      }
      order.hiddenForBuyer = true;
      addLog(s, user, 'riwayat_dihapus', user.name + ' menyembunyikan riwayat ' + order.id + '.');
    });
  },

  reviewOrder(id, approve) {
    return change((s) => {
      const admin = actor(s, ['admin']);
      const order = findOrder(s, id);
      if (order.status !== 'menunggu_admin') {
        throw new Error('Pesanan ini sudah diputuskan atau belum menunggu admin.');
      }
      flag(approve, 'Pilih keputusan admin yang valid.');
      const receiver = byId(s.users, approve ? order.sellerId : order.buyerId);
      if (!receiver) {
        throw new Error('Akun penerima saldo tidak ditemukan.');
      }
      receiver.balance += approve ? order.price : order.total;
      order.status = approve ? 'selesai' : 'direfund';
      order.closedAt = new Date().toISOString();
      order.adminId = admin.id;
      if (approve) {
        addLog(s, admin, 'order_disetujui', 'Admin menyetujui ' + order.id + '.');
      } else {
        addLog(s, admin, 'order_direfund', 'Admin mengembalikan pembayaran ' + order.id + '.');
      }
      return order;
    });
  },

  saveUser(draft) {
    return change((s) => {
      const admin = actor(s, ['admin']);
      const existing = draft.id ? byId(s.users, draft.id) : null;
      if (draft.id && !existing) {
        throw new Error('Akun tidak ditemukan.');
      }
      if (existing && (existing.id === admin.id || existing.role === 'admin')) {
        throw new Error('Akun admin tidak dapat diubah melalui manajemen akun.');
      }

      const role = text(draft.role || (existing && existing.role) || 'pencari');
      const status = text(draft.status || (existing && existing.status) || 'aktif');
      if (role !== 'pencari' && role !== 'penyedia') {
        throw new Error('Role harus pencari atau penyedia.');
      }
      if (status !== 'aktif' && status !== 'diblokir') {
        throw new Error('Status akun tidak valid.');
      }
      if (existing && role !== existing.role && hasOpenOrder(s, existing.id)) {
        throw new Error('Role akun dengan pesanan aktif belum dapat diubah.');
      }

      const address = checkEmail(draft.email ?? (existing && existing.email));
      if (emailTaken(s, address, existing && existing.id)) {
        throw new Error('Email sudah dipakai.');
      }
      let pass = existing && existing.password;
      if (draft.password) {
        pass = checkPassword(draft.password);
      }
      if (!pass) {
        throw new Error('Password minimal 6 karakter.');
      }

      let balance = draft.balance;
      if (balance === undefined || balance === null) {
        balance = existing ? existing.balance : role === 'pencari' ? START_BALANCE : 0;
      }

      const user = {
        ...existing,
        id: existing ? existing.id : newId('user'),
        createdAt: (existing && existing.createdAt) || new Date().toISOString(),
        name: required(draft.name ?? (existing && existing.name), 'Nama', 2),
        email: address,
        password: pass,
        location: required(draft.location ?? (existing && existing.location), 'Lokasi', 2),
        role,
        status,
        balance: money(balance, 'Saldo demo', true),
      };

      if (existing) {
        s.users[s.users.indexOf(existing)] = user;
      } else {
        s.users.push(user);
      }
      syncLocations(s, user);
      const action = existing ? 'akun_diperbarui' : 'akun_ditambahkan';
      const verb = existing ? 'memperbarui' : 'menambahkan';
      addLog(s, admin, action, 'Admin ' + verb + ' akun ' + user.name + ': ' + role + ', ' + status + '.');
      return user;
    });
  },

  deleteUser(id) {
    change((s) => {
      const admin = actor(s, ['admin']);
      const user = byId(s.users, id);
      if (!user || user.id === admin.id || user.role === 'admin') {
        throw new Error('Akun admin tidak dapat dihapus.');
      }
      dropUser(s, user.id);
      addLog(s, admin, 'akun_dihapus', 'Admin menghapus akun ' + user.name + '.');
    });
  },
};
