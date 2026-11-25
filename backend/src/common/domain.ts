import { HttpException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { Transaction } from '../database/database.service';

export const FINAL = ['selesai', 'direfund', 'dibatalkan'] as const;
export const CATEGORIES = ['desain', 'koding', 'video', 'konten', 'foto'];
export const available = {
  deletedAt: null,
  hidden: false,
  owner: { deletedAt: null, status: 'aktif' as const, role: 'penyedia' as const },
};
export const publicUserSelect = {
  id: true,
  name: true,
  avatar: true,
  location: true,
  skills: true,
  experience: true,
  deletedAt: true,
} as const;
export const serviceInclude = {
  owner: { select: { ...publicUserSelect, status: true, role: true } },
  packages: { where: { active: true }, orderBy: { position: 'asc' as const } },
  reviews: { select: { rating: true } },
};

export function fail(message: string, code = 'INVALID_REQUEST', status = 400): never {
  throw new HttpException({ code, message }, status);
}
export function missing(): never {
  return fail('Data tidak ditemukan.', 'NOT_FOUND', 404);
}
export function conflict(message = 'Data sudah berubah atau pesanan sudah diproses.'): never {
  return fail(message, 'STATE_CONFLICT', 409);
}
export function privateUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    location: user.location,
    balance: user.balance,
    avatar: user.avatar,
    latitude: user.latitude,
    longitude: user.longitude,
    skills: user.skills,
    experience: user.experience,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

type PublicProfile = Pick<
  User,
  'id' | 'name' | 'avatar' | 'location' | 'skills' | 'experience' | 'deletedAt'
>;

export function publicUser(user: PublicProfile) {
  if (user.deletedAt) {
    return {
      id: user.id,
      name: 'Akun dihapus',
      avatar: '',
      location: '',
      skills: '',
      experience: '',
    };
  }
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    location: user.location,
    skills: user.skills,
    experience: user.experience,
  };
}
export function serviceDto(service: Prisma.ServiceGetPayload<{ include: typeof serviceInclude }>) {
  let totalRating = 0;
  for (const review of service.reviews) {
    totalRating += review.rating;
  }
  let averageRating = 0;
  if (service.reviews.length > 0) {
    averageRating = totalRating / service.reviews.length;
  }

  const owner = service.owner;
  const isAvailable =
    !service.hidden &&
    !service.deletedAt &&
    !owner.deletedAt &&
    owner.role === 'penyedia' &&
    owner.status === 'aktif';
  return {
    id: service.id,
    ownerId: service.ownerId,
    title: service.title,
    category: service.category,
    description: service.description,
    days: service.days,
    portfolioUrl: service.portfolioUrl,
    image: service.image,
    hidden: service.hidden,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    packages: service.packages,
    available: isAvailable,
    location: owner.location,
    owner: publicUser(owner),
    rating: averageRating,
    reviewCount: service.reviews.length,
  };
}
export function paginate<T>(items: T[], query: { page: number; pageSize: number }) {
  const start = (query.page - 1) * query.pageSize;
  return {
    data: items.slice(start, start + query.pageSize),
    meta: { page: query.page, pageSize: query.pageSize, total: items.length },
  };
}
export async function log(
  transaction: Transaction,
  actorId: string | null,
  action: string,
  details: string,
) {
  await transaction.activityLog.create({ data: { actorId, action, details } });
}
export async function entry(
  transaction: Transaction,
  userId: string,
  amount: bigint,
  kind: string,
  operationKey: string,
  orderId?: string,
) {
  await transaction.balanceEntry.create({ data: { userId, amount, kind, operationKey, orderId } });
}
export async function hasOpenOrder(transaction: Transaction, userId: string) {
  return transaction.order.count({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }], status: { notIn: [...FINAL] } },
  });
}
