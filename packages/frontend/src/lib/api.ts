import { API_BASE_URL } from './constants';
import {
  authResponseSchema,
  transactionSchema,
  transactionsResponseSchema,
  budgetSchema,
  budgetsResponseSchema,
  reportResponseSchema,
  type SignUpInput,
  type SignInInput,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type CreateBudgetInput,
  type UpdateBudgetInput,
  type AuthResponse,
  type Transaction,
  type TransactionsResponse,
  type Budget,
  type BudgetsResponse,
  type ReportResponse,
} from './schemas';

class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: { parse: (data: unknown) => T }
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message || 'An error occurred');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  
  if (schema) {
    return schema.parse(data);
  }
  
  return data as T;
}

// Auth API
export const authApi = {
  signUp: async (input: Omit<SignUpInput, 'confirmPassword'>): Promise<AuthResponse> => {
    return fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    }, authResponseSchema);
  },

  signIn: async (input: SignInInput): Promise<AuthResponse> => {
    return fetchApi('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(input),
    }, authResponseSchema);
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<TransactionsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return fetchApi(`/transactions${query ? `?${query}` : ''}`, {}, transactionsResponseSchema);
  },

  getById: async (id: string): Promise<Transaction> => {
    return fetchApi(`/transactions/${id}`, {}, transactionSchema);
  },

  create: async (input: CreateTransactionInput): Promise<Transaction> => {
    return fetchApi('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    }, transactionSchema);
  },

  update: async (id: string, input: UpdateTransactionInput): Promise<Transaction> => {
    return fetchApi(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }, transactionSchema);
  },

  delete: async (id: string): Promise<void> => {
    return fetchApi(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Budgets API
export const budgetsApi = {
  getAll: async (params?: {
    category?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<BudgetsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.month) searchParams.set('month', params.month.toString());
    if (params?.year) searchParams.set('year', params.year.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return fetchApi(`/budgets${query ? `?${query}` : ''}`, {}, budgetsResponseSchema);
  },

  getById: async (id: string): Promise<Budget> => {
    return fetchApi(`/budgets/${id}`, {}, budgetSchema);
  },

  create: async (input: CreateBudgetInput): Promise<Budget> => {
    return fetchApi('/budgets', {
      method: 'POST',
      body: JSON.stringify(input),
    }, budgetSchema);
  },

  update: async (id: string, input: UpdateBudgetInput): Promise<Budget> => {
    return fetchApi(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }, budgetSchema);
  },

  delete: async (id: string): Promise<void> => {
    return fetchApi(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reports API
export const reportsApi = {
  getMonthlyReport: async (month: number, year: number): Promise<ReportResponse> => {
    return fetchApi(`/reports?month=${month}&year=${year}`, {}, reportResponseSchema);
  },
};

export { ApiError };