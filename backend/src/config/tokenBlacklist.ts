/**
 * TokenBlacklist — armazena tokens JWT invalidados (logout).
 *
 * Abordagem em memória: simples, zero dependência extra, adequada para MVP.
 * Em produção com múltiplas instâncias, trocar por Redis:
 *   await redis.set(`bl:${jti}`, '1', 'EXAT', exp);
 *
 * Limpeza automática: a cada 15 minutos remove tokens já expirados
 * para evitar crescimento indefinido do Set.
 */

interface BlacklistedToken {
  token: string;
  expiresAt: number; // epoch em ms
}

class TokenBlacklist {
  private store = new Map<string, BlacklistedToken>();

  /** Adiciona um token à blacklist até sua expiração natural. */
  add(token: string, expiresAt: number): void {
    this.store.set(token, { token, expiresAt });
  }

  /** Verifica se o token está na blacklist. */
  has(token: string): boolean {
    const entry = this.store.get(token);
    if (!entry) return false;

    // Token já expirou na blacklist, pode remover
    if (Date.now() > entry.expiresAt) {
      this.store.delete(token);
      return false;
    }

    return true;
  }

  /** Remove entradas vencidas (chamado pelo cleanup periódico). */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  startCleanup(intervalMs = 15 * 60 * 1000): void {
    setInterval(() => this.cleanup(), intervalMs).unref();
  }
}

export const tokenBlacklist = new TokenBlacklist();