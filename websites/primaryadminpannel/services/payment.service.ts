import api from "@/lib/api";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type {
  BookingPaymentCreatePayload,
  Payment,
  PaymentCreatePayload,
  PaymentFilters,
  PaymentOrder,
  PublicPaymentOrderPayload,
  RazorpayConfirmPayload,
} from "@/types/payment";

export interface PaymentListParams
  extends PaginationParams,
    PaymentFilters {}

const unwrap = <T>(response: {
  data: ApiSuccessResponse<T>;
}): T => response.data.data;

export const paymentService = {
  async getPayments(
    params?: PaymentListParams,
  ): Promise<PaginatedResponse<Payment>> {
    return unwrap(
      await api.get<
        ApiSuccessResponse<PaginatedResponse<Payment>>
      >("/admin/payments/", { params }),
    );
  },

  async getPayment(paymentId: string): Promise<Payment> {
    return unwrap(
      await api.get<ApiSuccessResponse<Payment>>(
        `/admin/payments/${paymentId}/`,
      ),
    );
  },

  async createPayment(
    payload: PaymentCreatePayload,
  ): Promise<Payment> {
    return unwrap(
      await api.post<ApiSuccessResponse<Payment>>(
        "/admin/payments/",
        payload,
      ),
    );
  },

  async createBookingPayment(
    bookingId: string,
    payload: BookingPaymentCreatePayload,
  ): Promise<Payment> {
    return unwrap(
      await api.post<ApiSuccessResponse<Payment>>(
        `/admin/bookings/${bookingId}/payments/`,
        payload,
      ),
    );
  },

  async createRazorpayOrder(
    payload: PublicPaymentOrderPayload,
  ): Promise<PaymentOrder> {
    return unwrap(
      await api.post<ApiSuccessResponse<PaymentOrder>>(
        "/payments/razorpay/orders/",
        payload,
      ),
    );
  },

  async confirmRazorpayPayment(
    payload: RazorpayConfirmPayload,
  ): Promise<Payment> {
    return unwrap(
      await api.post<ApiSuccessResponse<Payment>>(
        "/payments/razorpay/confirm/",
        payload,
      ),
    );
  },

  async createUpiQrOrder(
    payload: PublicPaymentOrderPayload,
  ): Promise<PaymentOrder> {
    return unwrap(
      await api.post<ApiSuccessResponse<PaymentOrder>>(
        "/payments/upi/qr/",
        payload,
      ),
    );
  },
};

export default paymentService;
