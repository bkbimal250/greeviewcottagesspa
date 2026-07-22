export interface Guest {
  supported: false;
}

export const guestService = {
  async getGuests(): Promise<Guest[]> {
    return [];
  },
};

export default guestService;
