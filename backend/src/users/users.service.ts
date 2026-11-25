import { safeUrl } from '../services/services.service';
import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { AdminUserDto, AdminUserPatchDto, PageQuery, ProfileDto, ProviderDto } from '../common/dto';
import {
  conflict,
  entry,
  hasOpenOrder,
  log,
  missing,
  paginate,
  privateUser,
} from '../common/domain';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}
  async profile(id: string, body: ProfileDto) {
    if (body.avatar) {
      body.avatar = safeUrl(body.avatar, true);
    }
    if ((body.latitude == null) !== (body.longitude == null)) {
      conflict('Isi latitude dan longitude bersamaan.');
    }
    return this.database.transaction(async (transaction) => {
      const user = await transaction.user.update({ where: { id }, data: body });
      await log(transaction, id, 'profil_diperbarui', `${user.name} memperbarui profil.`);
      return privateUser(user);
    });
  }
  async provider(id: string, body: ProviderDto) {
    return this.database.transaction(async (transaction) => {
      const current = await transaction.user.findUniqueOrThrow({ where: { id } });
      if (current.role !== 'pencari') {
        conflict('Akun sudah menjadi penyedia.');
      }
      const profileData: Prisma.UserUpdateInput = {
        skills: body.skills || '',
        experience: body.experience || '',
        role: 'penyedia',
      };
      if (body.location) {
        profileData.location = body.location;
      }
      const user = await transaction.user.update({
        where: { id },
        data: profileData,
      });
      await log(transaction, id, 'daftar_penyedia', `${user.name} menjadi penyedia.`);
      return privateUser(user);
    });
  }
  async remove(id: string, actorId: string) {
    await this.database.transaction(async (transaction) => {
      const user = await transaction.user.findFirst({
        where: { id, deletedAt: null, role: { not: 'admin' } },
      });
      if (!user) {
        missing();
      }
      if (await hasOpenOrder(transaction, id)) {
        conflict('Akun masih memiliki pesanan aktif.');
      }
      await transaction.user.update({
        where: { id },
        data: { deletedAt: new Date(), sessionVersion: { increment: 1 } },
      });
      await transaction.service.updateMany({
        where: { ownerId: id },
        data: { deletedAt: new Date() },
      });
      await transaction.favorite.deleteMany({ where: { userId: id } });
      await transaction.recentView.deleteMany({ where: { userId: id } });
      await transaction.review.deleteMany({ where: { userId: id } });
      await log(
        transaction,
        actorId,
        actorId === id ? 'hapus_akun_sendiri' : 'akun_dihapus',
        `Akun ${user.name} dihapus.`,
      );
    });
  }
  async list(query: PageQuery) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { location: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    const rows = await this.database.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return paginate(rows.map(privateUser), query);
  }
  async save(adminId: string, body: AdminUserDto | AdminUserPatchDto, id?: string) {
    let passwordHash: string | undefined;
    if (body.password) {
      passwordHash = await hash(body.password);
    }
    return this.database.transaction(async (transaction) => {
      let existing = null;
      if (id) {
        existing = await transaction.user.findFirst({
          where: { id, deletedAt: null, role: { not: 'admin' } },
        });
      }
      if (id && !existing) {
        missing();
      }
      if (
        existing &&
        body.role &&
        body.role !== existing.role &&
        (await hasOpenOrder(transaction, existing.id))
      ) {
        conflict('Role akun dengan pesanan aktif tidak dapat diubah.');
      }
      const balance = body.balance;
      const data: Prisma.UserUpdateInput = {
        name: body.name,
        location: body.location,
        role: body.role,
        status: body.status,
      };
      if (body.email) {
        data.email = body.email.toLowerCase();
      }
      if (passwordHash) {
        data.passwordHash = passwordHash;
      }
      if (balance !== undefined) {
        data.balance = BigInt(balance);
      }
      let user;
      if (existing) {
        const statusChanged = body.status && body.status !== existing.status;
        const roleChanged = body.role && body.role !== existing.role;
        if (passwordHash || statusChanged || roleChanged) {
          data.sessionVersion = { increment: 1 };
        }
        user = await transaction.user.update({
          where: { id },
          data,
        });
        if (balance !== undefined && BigInt(balance) !== existing.balance) {
          await entry(
            transaction,
            user.id,
            BigInt(balance) - existing.balance,
            'adjustment',
            `adjustment:${randomUUID()}`,
          );
        }
      } else {
        const create = body as AdminUserDto;
        user = await transaction.user.create({
          data: {
            name: create.name,
            email: create.email.toLowerCase(),
            location: create.location,
            role: create.role,
            status: create.status,
            balance: BigInt(create.balance),
            passwordHash: passwordHash!,
          },
        });
        await entry(transaction, user.id, user.balance, 'opening', `opening:${user.id}`);
      }
      await log(
        transaction,
        adminId,
        existing ? 'akun_diperbarui' : 'akun_ditambahkan',
        `Admin menyimpan akun ${user.name}.`,
      );
      return privateUser(user);
    });
  }
}
