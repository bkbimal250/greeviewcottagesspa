import api from "@/lib/api";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type {
  CreatePropertyPayload,
  Property,
  PropertyFilters,
  PropertyImageType,
  PropertyImageUploadResult,
  PropertyListItem,
  UpdatePropertyPayload,
} from "@/types/property";

export interface PropertyListParams
  extends PaginationParams,
    PropertyFilters {}

const unwrap = <T>(response: {
  data: ApiSuccessResponse<T>;
}): T => response.data.data;

export const propertyService = {
  async getPublicProperty(): Promise<Property | Record<string, never>> {
    return unwrap(
      await api.get<ApiSuccessResponse<Property | Record<string, never>>>(
        "/property/",
      ),
    );
  },

  async getProperties(
    params?: PropertyListParams,
  ): Promise<PaginatedResponse<PropertyListItem>> {
    return unwrap(
      await api.get<
        ApiSuccessResponse<PaginatedResponse<PropertyListItem>>
      >("/admin/property/", { params }),
    );
  },

  async getProperty(propertyId: string): Promise<Property> {
    return unwrap(
      await api.get<ApiSuccessResponse<Property>>(
        `/admin/property/${propertyId}/`,
      ),
    );
  },

  async createProperty(
    payload: CreatePropertyPayload,
  ): Promise<Property> {
    return unwrap(
      await api.post<ApiSuccessResponse<Property>>(
        "/admin/property/",
        payload,
      ),
    );
  },

  async updateProperty(
    propertyId: string,
    payload: UpdatePropertyPayload,
  ): Promise<Property> {
    return unwrap(
      await api.patch<ApiSuccessResponse<Property>>(
        `/admin/property/${propertyId}/`,
        payload,
      ),
    );
  },

  async uploadImage(
    propertyId: string,
    imageType: PropertyImageType,
    image: File,
  ): Promise<PropertyImageUploadResult> {
    const formData = new FormData();
    formData.append("image_type", imageType);
    formData.append("image", image);

    return unwrap(
      await api.post<
        ApiSuccessResponse<PropertyImageUploadResult>
      >(
        `/admin/property/${propertyId}/upload-image/`,
        formData,
      ),
    );
  },
};

export default propertyService;
