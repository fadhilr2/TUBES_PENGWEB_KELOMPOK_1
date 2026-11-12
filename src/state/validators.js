export const FINAL_STATUSES = ['selesai', 'direfund', 'dibatalkan'];
export const CATEGORIES = ['desain', 'koding', 'video', 'konten', 'foto'];

export function newId(prefix) {
  return prefix + '-' + crypto.randomUUID();
}

export function text(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

export function required(value, label, minimum = 1) {
  const result = text(value);
  if (result.length < minimum) {
    let message = label + ' wajib diisi';
    if (minimum > 1) {
      message += ', minimal ' + minimum + ' karakter';
    }
    throw new Error(message + '.');
  }
  return result;
}

export function email(value) {
  const result = text(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) {
    throw new Error('Isi alamat email yang valid.');
  }
  return result;
}

export function password(value) {
  const result = value === null || value === undefined ? '' : String(value);
  if (result.length < 6 || !result.trim()) {
    throw new Error('Password minimal 6 karakter.');
  }
  return result;
}

export function money(value, label, allowZero = false) {
  const result = Number(value);
  const smallest = allowZero ? 0 : 1;
  if (!Number.isSafeInteger(result) || result < smallest || result > 1000000000) {
    throw new Error(label + ' harus berupa nominal rupiah yang valid.');
  }
  return result;
}

export function url(value, label, optional = true, allowInternalPath = false) {
  const result = text(value);
  if (!result && optional) {
    return '';
  }
  if (allowInternalPath && result.startsWith('/') && !result.startsWith('//')) {
    return result;
  }
  try {
    const parsed = new URL(result);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error();
    }
    return parsed.href;
  } catch {
    throw new Error(label + ' harus berupa URL http atau https yang valid.');
  }
}

export function flag(value, message) {
  if (typeof value !== 'boolean') {
    throw new Error(message);
  }
  return value;
}
