// src/studio/dto/credits.dto.ts

export interface GetCreditsBalanceResponse {
  success: boolean;
  data: {
    total: number;
    used: number;
    remaining: number;
    carryForward: number;
    lastReset: Date;
    nextReset: Date;
  };
}

export interface DeductCreditsRequest {
  userId: string;
  amount: number;
  reason: string;
}

export interface DeductCreditsResponse {
  success: boolean;
  data: {
    amount: number;
    type: 'deduct';
    reason: string;
    timestamp: Date;
    newBalance: number;
  };
}

export interface AddCreditsRequest {
  userId: string;
  amount: number;
  reason: string;
}

export interface AddCreditsResponse {
  success: boolean;
  data: {
    amount: number;
    type: 'add';
    reason: string;
    timestamp: Date;
    newBalance: number;
  };
}