export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

export interface DjangoPaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type PaginatedResponse<T> =
  DjangoPaginatedData<T>;

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface UploadResult {
  image_type: string;
  path: string;
  url: string;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export type QueryParams = PaginationParams &
  Record<
    string,
    string | number | boolean | undefined
  >;
