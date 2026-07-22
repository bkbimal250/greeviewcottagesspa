export interface DashboardOverview {
  supported: false;
  message: string;
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return {
      supported: false,
      message:
        "The backend does not expose dashboard summary endpoints yet.",
    };
  },
};

export default dashboardService;
