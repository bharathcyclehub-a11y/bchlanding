// Accessories catalog for BCH Store
// Only the 11 items provided in the accessory list

export const accessories = [
  {
    id: "acc-bell-001",
    name: "Classic Bike Bell - Loud Ring",
    category: "safety",
    price: 149,
    mrp: 249,
    image: "https://images.unsplash.com/photo-1591258739299-5b65d5cbb235?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: null,
    shortDescription: "Durable metal bell with clear, loud ring for safe riding"
  },
  {
    id: "acc-lock-001",
    name: "Heavy Duty U-Lock with Cable",
    category: "security",
    price: 899,
    mrp: 1499,
    image: "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: "Top Pick",
    shortDescription: "Hardened steel U-lock with 4-foot flex cable for maximum security"
  },
  {
    id: "acc-mudguards-001",
    name: "Full Coverage Mudguard Set",
    category: "comfort",
    price: 599,
    mrp: 999,
    image: "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?w=400&h=400&fit=crop",
    compatibleWith: ["city", "geared", "electric"],
    badge: null,
    shortDescription: "Adjustable mudguards protect from splashes in all weather"
  },
  {
    id: "acc-bottle-holder-001",
    name: "Aluminum Water Bottle Cage",
    category: "storage",
    price: 249,
    mrp: 399,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop",
    compatibleWith: ["geared", "mountain", "city", "electric"],
    badge: null,
    shortDescription: "Lightweight aluminum cage holds bottles securely on rough terrain"
  },
  {
    id: "acc-bottle-001",
    name: "Insulated Water Bottle (750ml)",
    category: "hydration",
    price: 349,
    mrp: 599,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: null,
    shortDescription: "Double-wall insulated bottle keeps water cold for 6 hours, fits standard cages"
  },
  {
    id: "acc-pump-001",
    name: "Portable Mini Floor Pump with Gauge",
    category: "maintenance",
    price: 499,
    mrp: 799,
    image: "https://images.unsplash.com/photo-1576025185848-fda03a6c0e70?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: null,
    shortDescription: "Compact pump with pressure gauge, Presta and Schrader valve compatible"
  },
  {
    id: "acc-helmet-001",
    name: "ISI Certified Safety Helmet - Adult",
    category: "safety",
    price: 799,
    mrp: 1299,
    image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: "Safety Essential",
    shortDescription: "ISI certified protective helmet with adjustable straps and ventilation"
  },
  {
    id: "acc-glasses-001",
    name: "UV400 Cycling Sunglasses",
    category: "safety",
    price: 499,
    mrp: 899,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: "Popular",
    shortDescription: "UV400 polarized lenses with anti-slip nose pads for clear, safe riding"
  },
  {
    id: "acc-lights-001",
    name: "LED Front + Rear Light Combo",
    category: "safety",
    price: 449,
    mrp: 799,
    image: "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: null,
    shortDescription: "USB rechargeable LED lights with 5 modes for enhanced visibility"
  },
  {
    id: "acc-seat-cover-001",
    name: "Gel Padded Seat Cover",
    category: "comfort",
    price: 399,
    mrp: 699,
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop",
    compatibleWith: ["all"],
    badge: null,
    shortDescription: "Soft gel seat cover with breathable mesh for extra comfort on long rides"
  },
  {
    id: "acc-carrier-001",
    name: "Rear Carrier Rack - Universal",
    category: "storage",
    price: 699,
    mrp: 1199,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop",
    compatibleWith: ["city", "geared", "electric"],
    badge: null,
    shortDescription: "Heavy-duty alloy rear rack with 25kg capacity, fits most 26T-28T frames"
  },
];

// Service centers for warranty section
export const serviceCenters = [
  {
    id: "sc-bangalore-1",
    city: "Bangalore",
    area: "HSR Layout",
    address: "Shop 42, 24th Main Road, Sector 2, HSR Layout",
    phone: "8892031480",
    timings: "10 AM - 8 PM (Mon-Sat)"
  },
  {
    id: "sc-bangalore-2",
    city: "Bangalore",
    area: "Indiranagar",
    address: "123, 100 Feet Road, Indiranagar",
    phone: "8892031480",
    timings: "9 AM - 7 PM (Mon-Sun)"
  },
  {
    id: "sc-bangalore-3",
    city: "Bangalore",
    area: "Koramangala",
    address: "456, 5th Block, Koramangala",
    phone: "8892031480",
    timings: "10 AM - 8 PM (Tue-Sun)"
  },
  {
    id: "sc-mumbai-1",
    city: "Mumbai",
    area: "Andheri West",
    address: "Plot 78, Veera Desai Road, Andheri West",
    phone: "8892031480",
    timings: "10 AM - 7 PM (Mon-Sat)"
  },
  {
    id: "sc-mumbai-2",
    city: "Mumbai",
    area: "Bandra",
    address: "12, Hill Road, Bandra West",
    phone: "8892031480",
    timings: "9:30 AM - 8 PM (Mon-Sat)"
  },
  {
    id: "sc-delhi-1",
    city: "Delhi",
    area: "Connaught Place",
    address: "Block E, Inner Circle, Connaught Place",
    phone: "8892031480",
    timings: "10 AM - 8 PM (Mon-Sat)"
  },
  {
    id: "sc-delhi-2",
    city: "Delhi",
    area: "Lajpat Nagar",
    address: "Central Market, Lajpat Nagar IV",
    phone: "8892031480",
    timings: "10 AM - 7 PM (Tue-Sun)"
  },
  {
    id: "sc-pune-1",
    city: "Pune",
    area: "Koregaon Park",
    address: "Lane 7, North Main Road, Koregaon Park",
    phone: "8892031480",
    timings: "9 AM - 7 PM (Mon-Sat)"
  },
  {
    id: "sc-chennai-1",
    city: "Chennai",
    area: "T Nagar",
    address: "89, Usman Road, T Nagar",
    phone: "8892031480",
    timings: "10 AM - 8 PM (Mon-Sat)"
  },
  {
    id: "sc-hyderabad-1",
    city: "Hyderabad",
    area: "Banjara Hills",
    address: "Road No 12, Banjara Hills",
    phone: "8892031480",
    timings: "10 AM - 7:30 PM (Mon-Sun)"
  }
];
