/**
 * Fixed appointment length for online booking.
 * Slot starts are offered every {@link BOOKING_SLOT_MINUTES} minutes and each
 * booking blocks that same duration — independent of per-service catalog duration.
 */
export const BOOKING_SLOT_MINUTES = 40;
