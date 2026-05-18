// Returns the hotel whose check_in <= dateISO < check_out, or null.
export function hotelForDate(dateISO, hotels) {
  return hotels.find(h => h.check_in <= dateISO && dateISO < h.check_out) ?? null
}
