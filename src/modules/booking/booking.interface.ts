export type ICreateBookingRequest = {
  serviceId: string;
  bookingDate: string; // ISO 8601 string from frontend
  timeSlot: string;
};
