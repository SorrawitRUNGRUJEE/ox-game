import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly adminEmails: string[];

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.adminEmails = (config.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  upsertGoogleUser(data: { googleId: string; email: string; name: string }) {
    const isAdmin = this.adminEmails.includes(data.email.toLowerCase());
    return this.prisma.user.upsert({
      where: { googleId: data.googleId },
      create: {
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        role: isAdmin ? Role.ADMIN : Role.PLAYER,
      },
      update: {
        email: data.email,
        name: data.name,
        ...(isAdmin ? { role: Role.ADMIN } : {}),
      },
    });
  }
}
