import type { Booking } from "@/types/booking";

export type GuestGender =
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say";

export type GuestStatus =
  | "active"
  | "inactive"
  | "blacklisted";

export type IdentityDocumentType =
  | "aadhaar"
  | "passport"
  | "driving_license"
  | "voter_id"
  | "pan_card"
  | "other";

export interface GuestAddress {
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface GuestIdentityDocument {
  id?: string;
  type: IdentityDocumentType;
  number: string;
  frontImage?: string;
  backImage?: string;
  documentUrl?: string;
  verified?: boolean;
  verifiedAt?: string | null;
  expiresAt?: string | null;
}

export interface Guest {
  id: string;
  guestNumber?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  gender?: GuestGender;
  dateOfBirth?: string;
  nationality?: string;
  status: GuestStatus;
  address?: GuestAddress;
  identityDocuments?: GuestIdentityDocument[];
  identityVerified?: boolean;
  profileImage?: string;
  notes?: string;
  preferences?: string[];
  totalBookings?: number;
  totalSpent?: number;
  lastStayAt?: string | null;
  bookings?: Array<
    Pick<
      Booking,
      | "id"
      | "bookingNumber"
      | "status"
      | "checkInDate"
      | "checkOutDate"
    >
  >;
  createdAt: string;
  updatedAt: string;
}

export interface GuestFilters {
  search?: string;
  status?: GuestStatus;
  gender?: GuestGender;
  nationality?: string;
  city?: string;
  state?: string;
  identityVerified?: boolean;
  hasBookings?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateGuestPayload {
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  gender?: GuestGender;
  dateOfBirth?: string;
  nationality?: string;
  status?: GuestStatus;
  address?: GuestAddress;
  profileImage?: string;
  notes?: string;
  preferences?: string[];
  identityDocuments?: GuestIdentityDocument[];
}

export type UpdateGuestPayload =
  Partial<CreateGuestPayload>;

export interface UpdateGuestStatusPayload {
  status: GuestStatus;
  reason?: string;
  notes?: string;
}

export interface VerifyGuestIdentityPayload {
  documentId?: string;
  verified: boolean;
  notes?: string;
}

export interface AddGuestIdentityDocumentPayload {
  type: IdentityDocumentType;
  number: string;
  frontImage?: string;
  backImage?: string;
  documentUrl?: string;
  expiresAt?: string;
}

export interface GuestStayHistory {
  bookingId: string;
  bookingNumber: string;
  propertyId: string;
  propertyName: string;
  cottageId: string;
  cottageName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  bookingStatus: string;
  amount: number;
  currency: string;
}

export interface GuestStatistics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalNights: number;
  totalSpent: number;
  averageBookingValue: number;
  firstStayAt?: string | null;
  lastStayAt?: string | null;
}

export interface MergeGuestsPayload {
  primaryGuestId: string;
  duplicateGuestIds: string[];
}

export interface MergeGuestsResult {
  guest: Guest;
  mergedGuestIds: string[];
}