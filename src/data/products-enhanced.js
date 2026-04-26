/**
 * Enhanced product data with Phase 1 fields
 * Copy these examples into your products.js file
 */

// Example 1: Bestseller with LOW STOCK urgency
export const exampleProduct1 = {
  id: "kids-003",
  name: "Panda 16T Kids Bicycle",
  category: "kids",
  price: 4499,
  mrp: 5999,
  image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&h=300&fit=crop&q=80",
  specs: {
    wheelSize: '16"',
    frameType: "Steel",
    gearCount: "Single Speed",
    brakeType: "Caliper",
    weight: "9 kg",
    ageRange: "4–7 years",
  },
  badge: "Bestseller",
  shortDescription: "Best-selling 16-inch kids cycle with basket, bell, and removable training wheels.",

  // PHASE 1 ADDITIONS ⭐
  reviews: {
    averageRating: 4.7,
    totalReviews: 342
  },
  stock: 7,              // LOW STOCK - Shows orange warning
  recentPurchases: 24    // HIGH DEMAND - Shows social proof
};

// Example 2: Value Pick with good stock
export const exampleProduct2 = {
  id: "kids-001",
  name: "Sparrow 12T Kids Cycle",
  category: "kids",
  price: 3299,
  mrp: 4499,
  image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&q=80",
  specs: {
    wheelSize: '12"',
    frameType: "Steel",
    gearCount: "Single Speed",
    brakeType: "Coaster Brake",
    weight: "7.5 kg",
    ageRange: "3–5 years",
  },
  badge: "Value Pick",
  shortDescription: "Sturdy 12-inch starter cycle with training wheels and chain guard for toddlers.",

  // PHASE 1 ADDITIONS ⭐
  reviews: {
    averageRating: 4.3,
    totalReviews: 128
  },
  stock: 15,            // Good stock - Shows "In Stock"
  recentPurchases: 8    // Moderate demand
};

// Example 3: Electric bike with EMI calculator
export const exampleProduct3 = {
  id: "electric-001",
  name: "Thunderbolt E-Bike Pro",
  category: "electric",
  price: 35999,          // >= 10000 - EMI calculator will show
  mrp: 45999,
  image: "https://images.unsplash.com/photo-1591290619762-1e0cb6cf2e9c?w=400&h=300&fit=crop&q=80",
  specs: {
    wheelSize: '27.5"',
    frameType: "Aluminum Alloy",
    gearCount: "7 Speed",
    brakeType: "Disc Brake",
    motor: "250W Brushless",
    battery: "36V 10Ah Lithium",
    range: "40-50 km",
  },
  badge: "Top Pick",
  shortDescription: "Premium electric bicycle with 250W motor, 40-50km range, and pedal-assist technology.",

  // PHASE 1 ADDITIONS ⭐
  reviews: {
    averageRating: 4.8,
    totalReviews: 189
  },
  stock: 12,
  recentPurchases: 15
};

// Example 4: Mountain bike - OUT OF STOCK
export const exampleProduct4 = {
  id: "mountain-001",
  name: "峰 Peak Rider 29T MTB",
  category: "mountain",
  price: 18999,
  mrp: 24999,
  image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop&q=80",
  specs: {
    wheelSize: '29"',
    frameType: "Aluminum",
    gearCount: "21 Speed",
    brakeType: "Disc Brake",
    suspension: "Front Suspension",
    weight: "15 kg",
  },
  badge: "Top Pick",
  shortDescription: "Professional 29-inch mountain bike with front suspension, 21-speed gears, and disc brakes.",

  // PHASE 1 ADDITIONS ⭐
  reviews: {
    averageRating: 4.9,
    totalReviews: 567
  },
  stock: 0,              // OUT OF STOCK - Shows red alert with "Notify Me"
  recentPurchases: 45
};

/**
 * HOW TO USE:
 *
 * Copy the Phase 1 additions section from any example above and add it to
 * the corresponding product in src/data/products.js
 *
 * Example:
 *
 * In products.js, find the product and add the new fields:
 *
 * {
 *   id: "kids-003",
 *   name: "Panda 16T Kids Bicycle",
 *   // ... all existing fields ...
 *
 *   // ADD THESE NEW FIELDS:
 *   reviews: {
 *     averageRating: 4.7,
 *     totalReviews: 342
 *   },
 *   stock: 7,
 *   recentPurchases: 24
 * },
 */
