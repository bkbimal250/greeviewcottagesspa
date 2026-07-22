export interface ReportUnavailable {
  supported: false;
  message: string;
}

export const reportService = {
  async getReports(): Promise<ReportUnavailable> {
    return {
      supported: false,
      message:
        "The backend does not expose report endpoints yet.",
    };
  },
};

export default reportService;
