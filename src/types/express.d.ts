// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        subscriptionPlan?: string;
        planStatus?: string;
        userId?: string;
        role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
        iat?: number;
        exp?: number;
        [key: string]: any;
      };
    }
  }
}

export {};
