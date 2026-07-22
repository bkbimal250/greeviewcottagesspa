export interface UserManagementUnavailable {
  supported: false;
  message: string;
}

export const userService = {
  async getUsers(): Promise<UserManagementUnavailable> {
    return {
      supported: false,
      message:
        "The backend does not expose admin user-management endpoints yet.",
    };
  },
};

export default userService;
