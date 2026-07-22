export interface SettingsUnavailable {
  supported: false;
  message: string;
}

export const settingsService = {
  async getSettings(): Promise<SettingsUnavailable> {
    return {
      supported: false,
      message:
        "Dedicated settings endpoints are not implemented in the backend yet.",
    };
  },
};

export default settingsService;
