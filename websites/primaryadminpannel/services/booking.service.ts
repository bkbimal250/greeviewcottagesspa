import api from "@/lib/api";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type {
  Booking,
  BookingFilters,
  BookingListItem,
  BookingLookupPayload,
  CancelBookingPayload,
  CancellationRequest,
  CancellationRequestPayload,
  CreateBookingPayload,
  MarkPaymentPayload,
  PublicBooking,
  UpdateBookingPayload,
} from "@/types/booking";

export interface BookingListParams
  extends PaginationParams,
    BookingFilters {}

const unwrap = <T>(response: {
  data: ApiSuccessResponse<T>;
}): T => response.data.data;

export const bookingService = {
  async createBooking(
    payload: CreateBookingPayload,
  ): Promise<PublicBooking> {
    return unwrap(
      await api.post<ApiSuccessResponse<PublicBooking>>(
        "/bookings/",
        payload,
      ),
    );
  },

  async lookupBooking(
    payload: BookingLookupPayload,
  ): Promise<PublicBooking> {
    return unwrap(
      await api.post<ApiSuccessResponse<PublicBooking>>(
        "/bookings/lookup/",
        payload,
      ),
    );
  },

  async requestCancellation(
    payload: CancellationRequestPayload,
  ): Promise<CancellationRequest> {
    return unwrap(
      await api.post<ApiSuccessResponse<CancellationRequest>>(
        "/bookings/cancel-request/",
        payload,
      ),
    );
  },

  async getBookings(
    params?: BookingListParams,
  ): Promise<PaginatedResponse<BookingListItem>> {
    return unwrap(
      await api.get<
        ApiSuccessResponse<PaginatedResponse<BookingListItem>>
      >("/admin/bookings/", { params }),
    );
  },

  async getBooking(bookingId: string): Promise<Booking> {
    return unwrap(
      await api.get<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/`,
      ),
    );
  },

  async updateBooking(
    bookingId: string,
    payload: UpdateBookingPayload,
  ): Promise<Booking> {
    return unwrap(
      await api.patch<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/`,
        payload,
      ),
    );
  },

  async confirmBooking(bookingId: string): Promise<Booking> {
    return unwrap(
      await api.post<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/confirm/`,
      ),
    );
  },

  async cancelBooking(
    bookingId: string,
    payload: CancelBookingPayload,
  ): Promise<Booking> {
    return unwrap(
      await api.post<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/cancel/`,
        payload,
      ),
    );
  },

  async checkIn(bookingId: string): Promise<Booking> {
    return unwrap(
      await api.post<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/check-in/`,
      ),
    );
  },

  async checkOut(bookingId: string): Promise<Booking> {
    return unwrap(
      await api.post<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/check-out/`,
      ),
    );
  },

  async markPayment(
    bookingId: string,
    payload: MarkPaymentPayload,
  ): Promise<Booking> {
    return unwrap(
      await api.post<ApiSuccessResponse<Booking>>(
        `/admin/bookings/${bookingId}/mark-payment/`,
        payload,
      ),
    );
  },

  async resendNotification(
    bookingId: string,
  ): Promise<void> {
    await api.post<ApiSuccessResponse<Record<string, never>>>(
      `/admin/bookings/${bookingId}/resend-notification/`,
    );
  },
};

export default bookingService;
