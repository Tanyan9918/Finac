import { Request, Response, NextFunction, Router } from 'express';
import { z } from 'zod';
import { hashPassword, verifyPassword, newToken, hashToken } from './crypto';
import { userStore, sessionStore } from './store';

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

const credentials = z.object({
  userId: z.string().regex(/^[a-zA-Z0-9_]{3,32}$/).transform(s => s.toLowerCase()),
  password: z.string().min(8).max(128),
});

export interface AuthedRequest extends Request { uid?: number }

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = token ? await sessionStore.find(hashToken(token)) : undefined;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.uid = session.id;
  next();
}

let dummyHash: Promise<string> | undefined;

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { userId, password } = parsed.data;
  if (await userStore.findByUserId(userId)) return res.status(409).json({ error: 'User ID already taken' });

  const user = await userStore.create(userId, await hashPassword(password));
  res.status(201).json({ userId: user.userId });
});

authRouter.post('/login', async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const { userId, password } = parsed.data;
  const user = await userStore.findByUserId(userId);

  dummyHash ??= hashPassword('dummy-password');
  const ok = await verifyPassword(password, user ? user.passwordHash : await dummyHash);
  if (!user || !ok) return res.status(401).json({ error: 'Invalid user ID or password' });

  const token = newToken();
  await sessionStore.create(hashToken(token), user.id, SESSION_TTL);
  res.json({ token });
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  await sessionStore.delete(hashToken(req.headers.authorization!.replace('Bearer ', '')));
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await userStore.findById(req.uid!);
  res.json({ userId: user?.userId });
});