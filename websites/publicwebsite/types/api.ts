export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiErrors;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ApiErrors = Record<string, string[] | string>;

export class ApiError extends Error {
  status: number;
  errors?: ApiErrors;

  constructor(message: string, status: number, errors?: ApiErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
