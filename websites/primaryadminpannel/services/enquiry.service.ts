export interface Enquiry {
  supported: false;
}

export const enquiryService = {
  async getEnquiries(): Promise<Enquiry[]> {
    return [];
  },
};

export default enquiryService;
