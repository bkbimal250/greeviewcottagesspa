import cottageService from "@/services/cottage.service";
import type { PaginatedResponse, PaginationParams } from "@/types/api";
import type {
  AvailabilityQuery,
  AvailableCottage,
  CottageBlock,
  CreateCottageBlockPayload,
  UpdateCottageBlockPayload,
} from "@/types/cottage";

export const availabilityService = {
  async checkAvailability(
    params: AvailabilityQuery,
  ): Promise<AvailableCottage[]> {
    return cottageService.getAvailableCottages(params);
  },

  async getBlocks(
    params?: PaginationParams,
  ): Promise<PaginatedResponse<CottageBlock>> {
    return cottageService.getBlocks(params);
  },

  async getBlock(blockId: string): Promise<CottageBlock> {
    return cottageService.getBlock(blockId);
  },

  async blockAvailability(
    payload: CreateCottageBlockPayload,
  ): Promise<CottageBlock> {
    return cottageService.createBlock(payload);
  },

  async updateBlock(
    blockId: string,
    payload: UpdateCottageBlockPayload,
  ): Promise<CottageBlock> {
    return cottageService.updateBlock(blockId, payload);
  },

  async unblockAvailability(
    blockId: string,
  ): Promise<void> {
    await cottageService.deleteBlock(blockId);
  },
};

export default availabilityService;
