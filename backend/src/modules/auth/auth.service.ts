import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError';
import { usersRepository } from '../users/users.repository';
import { IUserPublic } from '../users/users.types';
import { LoginInput, LoginResult } from './auth.types';
import { generateAccessToken, toPublicUser } from './auth.helpers';
import { tokenBlacklist } from '../../config/tokenBlacklist';

export class AuthService {
  async login(input: LoginInput): Promise<LoginResult> {
    const user = await usersRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateAccessToken(user.id, user.role);

    return {
      token,
      user: toPublicUser(user),
    };
  }

  /**
   * Logout real: adiciona o token atual à blacklist até ele expirar.
   * Qualquer requisição subsequente com esse token receberá 401.
   */
  async logout(token: string): Promise<void> {
    try {
      const payload = jwt.decode(token) as { exp?: number } | null;
      // exp do JWT é em segundos; blacklist armazena em ms
      const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000;
      tokenBlacklist.add(token, expiresAt);
    } catch {
      // Token malformado → ignora, não é necessário invalidar
    }
  }

  async me(userId: string): Promise<IUserPublic> {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return user;
  }
}

export const authService = new AuthService();