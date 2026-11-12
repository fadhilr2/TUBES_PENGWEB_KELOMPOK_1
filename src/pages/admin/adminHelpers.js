export function formatDate(value) {
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) {
    return '-';
  }
  return result.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export function externalUrl(value) {
  try {
    const result = new URL(value);
    if (result.protocol === 'http:' || result.protocol === 'https:') {
      return result.href;
    }
    return null;
  } catch {
    return null;
  }
}

export function emptyAccount() {
  return {
    name: '',
    email: '',
    password: '',
    role: 'pencari',
    status: 'aktif',
    location: '',
    balance: 1000000,
  };
}

export function logDetails(log) {
  if (typeof log.details === 'string') {
    return log.details;
  }
  return JSON.stringify(log.details);
}

export function newestFirst(items) {
  const copy = items.slice();
  copy.sort(function compare(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return copy;
}

export function getAccountName(users, id) {
  if (!id) {
    return 'Sistem';
  }
  const found = users.find(function matchUser(account) {
    return account.id === id;
  });
  if (found && found.name) {
    return found.name;
  }
  return 'Akun dihapus';
}

export function sumBy(items, field) {
  let total = 0;
  for (const item of items) {
    total = total + item[field];
  }
  return total;
}

export function countByStatus(orders, statuses) {
  let count = 0;
  for (const order of orders) {
    if (statuses.includes(order.status)) {
      count = count + 1;
    }
  }
  return count;
}
