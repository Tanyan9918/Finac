import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';

const N = 16384, R = 8, P = 1, KEYLEN = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number, len: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, len, { N: n, r, p }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

// Stored format: scrypt$N$r$p$salt$hash
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P, KEYLEN);
  return ['scrypt', N, R, P, salt.toString('hex'), key.toString('hex')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, n, r, p, saltHex, keyHex] = stored.split('$');
  if (alg !== 'scrypt' || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const key = await derive(password, Buffer.from(saltHex, 'hex'), +n, +r, +p, expected.length);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');