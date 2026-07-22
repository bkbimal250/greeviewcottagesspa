import api from "@/lib/api";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type {
  AvailabilityQuery,
  AvailableCottage,
  Cottage,
  CottageBlock,
  CottageFilters,
  CottageHold,
  CottageHoldCreatePayload,
  CottageImageType,
  CottageImageUploadResult,
  CottageListItem,
  CreateCottageBlockPayload,
  CreateCottagePayload,
  UpdateCottageBlockPayload,
  UpdateCottagePayload,
} from "@/types/cottage";

export interface CottageListParams
  extends PaginationParams,
    CottageFilters {}

const unwrap = <T>(response: {
  data: ApiSuccessResponse<T>;
}): T => response.data.data;

export const cottageService = {
  async getPublicCottages(
    params?: CottageListParams,
  ): Promise<PaginatedResponse<CottageListItem>> {
    return unwrap(
      await api.get<
        ApiSuccessResponse<PaginatedResponse<CottageListItem>>
      >("/cottages/", { params }),
    );
  },

  async getAvailableCottages(
    params: AvailabilityQuery,
  ): Promise<AvailableCottage[]> {
    return unwrap(
      await api.get<ApiSuccessResponse<AvailableCottage[]>>(
        "/cottages/available/",
        { params },
      ),
    );
  },

  async createHold(
    payload: CottageHoldCreatePayload,
  ): Promise<CottageHold> {
    return unwrap(
      await api.post<ApiSuccessResponse<CottageHold>>(
        "/cottages/hold/",
        payload,
      ),
    );
  },

  async getPublicCottage(slug: string): Promise<Cottage> {
    return unwrap(
      await api.get<ApiSuccessResponse<Cottage>>(
        `/cottages/${slug}/`,
      ),
    );
  },

  async getCottages(
    params?: CottageListParams,
  ): Promise<PaginatedResponse<Cottage>> {
    return unwrap(
      await api.get<
        ApiSuccessResponse<PaginatedResponse<Cottage>>
      >("/admin/cottages/", { params }),
    );
  },

  async getCottage(cottageId: string): Promise<Cottage> {
    return unwrap(
      await api.get<ApiSuccessResponse<Cottage>>(
        `/admin/cottages/${cottageId}/`,
      ),
    );
  },

  async createCottage(
    payload: CreateCottagePayload,
  ): Promise<Cottage> {
    return unwrap(
      await api.post<ApiSuccessResponse<Cottage>>(
        "/admin/cottages/",
        payload,
      ),
    );
  },

  async updateCottage(
    cottageId: string,
    payload: UpdateCottagePayload,
  ): Promise<Cottage> {
    return unwrap(
      await api.patch<ApiSuccessResponse<Cottage>>(
        `/admin/cottages/${cottageId}/`,
        payload,
      ),
    );
  },

  async deleteCottage(cottageId: string): Promise<void> {
    await api.delete(`/admin/cottages/${cottageId}/`);
  },

  async uploadImage(
    cottageId: string,
    imageType: CottageImageType,
    image: File,
  ): Promise<CottageImageUploadResult> {
    const formData = new FormData();
    formData.append("image_type", imageType);
    formData.append("image", image);

    return unwrap(
      await api.post<ApiSuccessResponse<CottageImageUploadResult>>(
        `/admin/cottages/${cottageId}/upload-image/`,
        formData,
      ),
    );
  },

  async getBlocks(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<CottageBlock>> {
    return unwrap(
      await api.get<
        ApiSuccessResponse<PaginatedResponse<CottageBlock>>
      >("/admin/cottage-blocks/", { params }),
    );
  },

  async getBlock(blockId: string): Promise<CottageBlock> {
    return unwrap(
      await api.get<ApiSuccessResponse<CottageBlock>>(
        `/admin/cottage-blocks/${blockId}/`,
      ),
    );
  },

  async createBlock(
    payload: CreateCottageBlockPayload,
  ): Promise<CottageBlock> {
    return unwrap(
      await api.post<ApiSuccessResponse<CottageBlock>>(
        "/admin/cottage-blocks/",
        payload,
      ),
    );
  },

  async updateBlock(
    blockId: string,
    payload: UpdateCottageBlockPayload,
  ): Promise<CottageBlock> {
    return unwrap(
      await api.patch<ApiSuccessResponse<CottageBlock>>(
        `/admin/cottage-blocks/${blockId}/`,
        payload,
      ),
    );
  },

  async deleteBlock(blockId: string): Promise<void> {
    await api.delete(`/admin/cottage-blocks/${blockId}/`);
  },
};

export default cottageService;
