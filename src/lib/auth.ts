import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, TokenPayload } from './jwt';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name: string, role: 'ADMIN' | 'CLIENT' = 'CLIENT') {
  const hashedPassword = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      twoFactorEnabled: user.twoFactorEnabled,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshUserToken(refreshToken: string) {
  const { verifyRefreshToken, generateAccessToken } = await import('./jwt');
  const payload = verifyRefreshToken(refreshToken);
  const { userId } = payload;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  };
}

export async function logoutUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

