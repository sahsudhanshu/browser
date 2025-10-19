import { Request } from 'express';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

// API Response types
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
}

export interface QueryOptions {
    page: number;
    limit: number;
    sort: string;
    fields?: string;
}
