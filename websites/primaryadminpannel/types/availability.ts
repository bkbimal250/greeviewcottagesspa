import type {
  AvailableCottage,
  CottageBlock,
  CottageBlockType,
} from "@/types/cottage";

export type AvailabilityStatus =
  | "available"
  | "booked"
  | "blocked"
  | "maintenance"
  | "partial"
  | "unavailable";

export type AvailabilityBlockReason =
  | CottageBlockType
  | "owner_use"
  | "renovation"
  | "other";

export interface AvailabilityQuery {
  check_in: string;
  check_out: string;
  adults: number;
  children?: number;
}

export type AvailabilitySearchPayload =
  AvailabilityQuery;

export type AvailabilitySearchResult =
  AvailableCottage[];

export type AvailabilityCheckPayload =
  AvailabilityQuery;

export type AvailabilityCheckResult =
  AvailableCottage[];

export interface AvailabilityFilters {
  cottage?: string;
  cottageId?: string;
  propertyId?: string;
  status?: AvailabilityStatus;
  startDate?: string;
  endDate?: string;
  block_type?: CottageBlockType;
  start_date_from?: string;
  end_date_to?: string;
}

export type BlockAvailabilityPayload = {
  cottage: string;
  cottageIds?: string[];
  start_date: string;
  startDate?: string;
  end_date: string;
  endDate?: string;
  block_type: CottageBlockType;
  reasonType?: AvailabilityBlockReason;
  reason?: string;
};

export type AvailabilityCalendarDay = CottageBlock & {
  date?: string;
  status?: AvailabilityStatus;
  availableUnits?: number;
  totalUnits?: number;
  basePrice?: number;
  finalPrice?: number;
  minimumStay?: number;
};
export type AvailabilityRecord = AvailabilityCalendarDay;
export type AvailabilityCalendar = CottageBlock[];
export type CottageAvailability = {
  cottageId?: string;
  cottage?: {
    id?: string;
    name?: string;
    roomNumber?: string;
  };
  property?: {
    id?: string;
    name?: string;
  };
  startDate?: string;
  endDate?: string;
  calendar?: AvailabilityCalendarDay[];
};
export type CottageAvailabilitySummary = CottageBlock[];
export type UpdateAvailabilityPayload =
  Partial<BlockAvailabilityPayload>;
export type BulkAvailabilityPayload =
  BlockAvailabilityPayload[];
