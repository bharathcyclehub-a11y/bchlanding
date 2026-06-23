// ─────────────────────────────────────────────────────────────
// Viper "Batch 2" — confirmed bookings shown on the landing page
// for social proof / authenticity.
//
// ⚠️ THE ROWS BELOW ARE PLACEHOLDERS so the section can be previewed.
//    Replace them with the REAL bookings before going live.
//    Rules:
//      • Never publish fabricated bookings (only real, confirmed ones).
//      • Privacy: show first name + last initial + area only.
//      • Mask the phone number heavily, e.g. "+91 98●●●●●●21".
//      • Keep `bookedCount` equal to the true number of bookings.
// ─────────────────────────────────────────────────────────────

export const BATCH = {
  label: 'Batch 2',
  total: 75,            // bikes in this batch
  bookedCount: 33,      // ← real confirmed bookings so far
  accessoryCap: 50,     // first N bookings get 3 surprise accessories
  nextBatchMonths: 4,   // gap until the next batch arrives
  deliveryDate: '31 July 2026',
};

// status: 'Reserved' | 'In process'
export const BOOKINGS = [
  { name: 'Praveen K.',  area: 'Yelahanka',     phone: '+91 98●●●●●●21', date: '13 Jun', status: 'In process' },
  { name: 'Arjun R.',    area: 'Whitefield',    phone: '+91 99●●●●●●07', date: '13 Jun', status: 'In process' },
  { name: 'Deepak N.',   area: 'HSR Layout',    phone: '+91 90●●●●●●44', date: '14 Jun', status: 'In process' },
  { name: 'Imran S.',    area: 'Banashankari',  phone: '+91 73●●●●●●18', date: '14 Jun', status: 'Reserved' },
  { name: 'Karthik R.',  area: 'Marathahalli',  phone: '+91 98●●●●●●62', date: '14 Jun', status: 'Reserved' },
  { name: 'Suresh M.',   area: 'Koramangala',   phone: '+91 96●●●●●●09', date: '15 Jun', status: 'Reserved' },
  { name: 'Vinod P.',    area: 'Yelahanka',     phone: '+91 80●●●●●●77', date: '15 Jun', status: 'Reserved' },
  { name: 'Manoj T.',    area: 'BTM Layout',    phone: '+91 99●●●●●●31', date: '15 Jun', status: 'Reserved' },
  { name: 'Rahul K.',    area: 'Hebbal',        phone: '+91 97●●●●●●55', date: '16 Jun', status: 'Reserved' },
  { name: 'Lokesh V.',   area: 'Jayanagar',     phone: '+91 91●●●●●●12', date: '16 Jun', status: 'Reserved' },
  { name: 'Naveen B.',   area: 'Electronic City', phone: '+91 98●●●●●●40', date: '16 Jun', status: 'Reserved' },
  { name: 'Farhan A.',   area: 'Frazer Town',   phone: '+91 70●●●●●●83', date: '17 Jun', status: 'Reserved' },
  { name: 'Ganesh H.',   area: 'Rajajinagar',   phone: '+91 99●●●●●●26', date: '17 Jun', status: 'Reserved' },
  { name: 'Shwetha D.',  area: 'Malleshwaram',  phone: '+91 96●●●●●●71', date: '17 Jun', status: 'Reserved' },
];
