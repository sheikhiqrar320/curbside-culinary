import biryani from "@/assets/r-biryani.jpg";
import pizza from "@/assets/r-pizza.jpg";
import burger from "@/assets/r-burger.jpg";
import asian from "@/assets/r-asian.jpg";
import healthy from "@/assets/r-healthy.jpg";

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  category: string;
  recommended?: boolean;
  available?: boolean;
  restaurantId: string;
  image: string;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  cuisines: string[];
  rating: number;
  reviews: number;
  deliveryMins: [number, number];
  costForTwo: number;
  offer?: string;
  featured?: boolean;
  pureVeg?: boolean;
  description: string;
  image: string;
};

export const categories = [
  { id: "biryani", label: "Biryani", emoji: "🍛" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "asian", label: "Pan-Asian", emoji: "🍣" },
  { id: "healthy", label: "Healthy", emoji: "🥗" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
  { id: "rolls", label: "Rolls", emoji: "🌯" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
];

export const restaurants: Restaurant[] = [
  {
    id: "spice-route",
    slug: "spice-route-kitchen",
    name: "Spice Route Kitchen",
    cuisines: ["North Indian", "Biryani", "Mughlai"],
    rating: 4.6,
    reviews: 2841,
    deliveryMins: [30, 40],
    costForTwo: 600,
    offer: "50% OFF up to ₹150",
    featured: true,
    description:
      "Slow-cooked dum biryanis and charcoal kebabs from a kitchen that has been feeding the neighbourhood since 1998.",
    image: biryani,
  },
  {
    id: "dough-room",
    slug: "the-dough-room",
    name: "The Dough Room",
    cuisines: ["Italian", "Pizza", "Pasta"],
    rating: 4.8,
    reviews: 1920,
    deliveryMins: [25, 30],
    costForTwo: 800,
    offer: "Free delivery",
    featured: true,
    description: "Naples-style sourdough bases, 48-hour ferment, fior di latte from a local dairy.",
    image: pizza,
  },
  {
    id: "burger-theory",
    slug: "burger-theory",
    name: "Burger Theory",
    cuisines: ["American", "Burgers", "Shakes"],
    rating: 4.3,
    reviews: 3510,
    deliveryMins: [15, 25],
    costForTwo: 450,
    offer: "Flat ₹100 OFF above ₹399",
    featured: true,
    description: "Smashed patties, potato buns and thick shakes. Nothing else, done properly.",
    image: burger,
  },
  {
    id: "sakura-zen",
    slug: "sakura-zen",
    name: "Sakura Zen",
    cuisines: ["Pan-Asian", "Sushi", "Bowls"],
    rating: 4.7,
    reviews: 1204,
    deliveryMins: [40, 50],
    costForTwo: 1200,
    featured: true,
    description: "Sushi counter and donburi bowls, fish flown in twice a week.",
    image: asian,
  },
  {
    id: "green-harvest",
    slug: "green-harvest",
    name: "Green Harvest",
    cuisines: ["Healthy", "Salads", "Juices"],
    rating: 4.4,
    reviews: 860,
    deliveryMins: [20, 25],
    costForTwo: 350,
    pureVeg: true,
    offer: "20% OFF",
    description: "Cold-pressed juices and grain bowls built for people who actually read labels.",
    image: healthy,
  },
  {
    id: "tandoor-tales",
    slug: "tandoor-tales",
    name: "Tandoor Tales",
    cuisines: ["North Indian", "Kebabs"],
    rating: 4.1,
    reviews: 1480,
    deliveryMins: [35, 45],
    costForTwo: 700,
    description: "Clay-oven kebabs, rumali rotis and the buttery gravies you already know by heart.",
    image: biryani,
  },
];

export const dishes: Dish[] = [
  {
    id: "d1",
    name: "Hyderabadi Dum Chicken Biryani",
    description: "Long-grain basmati, bone-in chicken, saffron and fried onion. Serves 1–2.",
    price: 429,
    veg: false,
    category: "Biryani",
    recommended: true,
    restaurantId: "spice-route",
    image: biryani,
  },
  {
    id: "d2",
    name: "Paneer Tikka Biryani",
    description: "Charred paneer, mint and whole spices layered over dum rice.",
    price: 379,
    veg: true,
    category: "Biryani",
    recommended: true,
    restaurantId: "spice-route",
    image: biryani,
  },
  {
    id: "d3",
    name: "Old Delhi Butter Chicken",
    description: "Boneless thigh in a slow-reduced tomato and cashew gravy.",
    price: 449,
    veg: false,
    category: "Mains",
    restaurantId: "spice-route",
    image: biryani,
  },
  {
    id: "d4",
    name: "Double Cheese Margherita",
    description: "San Marzano tomato, fior di latte, basil, 48-hour sourdough base.",
    price: 329,
    veg: true,
    category: "Pizza",
    recommended: true,
    restaurantId: "dough-room",
    image: pizza,
  },
  {
    id: "d5",
    name: "Spicy Pepperoni",
    description: "Cup-and-char pepperoni, hot honey drizzle, chilli flakes.",
    price: 469,
    veg: false,
    category: "Pizza",
    restaurantId: "dough-room",
    image: pizza,
  },
  {
    id: "d6",
    name: "Truffle Mushroom Pasta",
    description: "Tagliatelle, cream, wild mushrooms, black truffle oil.",
    price: 419,
    veg: true,
    category: "Pasta",
    available: false,
    restaurantId: "dough-room",
    image: pizza,
  },
  {
    id: "d7",
    name: "Classic Double Smash",
    description: "Two smashed patties, American cheese, pickles, house sauce.",
    price: 289,
    veg: false,
    category: "Burgers",
    recommended: true,
    restaurantId: "burger-theory",
    image: burger,
  },
  {
    id: "d8",
    name: "Crispy Paneer Burger",
    description: "Buttermilk-fried paneer, slaw, sriracha mayo.",
    price: 249,
    veg: true,
    category: "Burgers",
    restaurantId: "burger-theory",
    image: burger,
  },
  {
    id: "d9",
    name: "Salmon Avocado Roll",
    description: "Eight pieces, Norwegian salmon, avocado, toasted sesame.",
    price: 549,
    veg: false,
    category: "Sushi",
    recommended: true,
    restaurantId: "sakura-zen",
    image: asian,
  },
  {
    id: "d10",
    name: "Veg Tempura Bowl",
    description: "Seasonal vegetables, sushi rice, ponzu and pickled ginger.",
    price: 399,
    veg: true,
    category: "Bowls",
    restaurantId: "sakura-zen",
    image: asian,
  },
  {
    id: "d11",
    name: "Harvest Grain Bowl",
    description: "Quinoa, roasted pumpkin, feta, pomegranate, lemon tahini.",
    price: 349,
    veg: true,
    category: "Bowls",
    recommended: true,
    restaurantId: "green-harvest",
    image: healthy,
  },
  {
    id: "d12",
    name: "Cold-Pressed Citrus Trio",
    description: "Orange, carrot and ginger. No added sugar.",
    price: 189,
    veg: true,
    category: "Juices",
    restaurantId: "green-harvest",
    image: healthy,
  },
  {
    id: "d13",
    name: "Galouti Kebab Platter",
    description: "Six melt-in-mouth kebabs with warqi paratha.",
    price: 499,
    veg: false,
    category: "Kebabs",
    recommended: true,
    restaurantId: "tandoor-tales",
    image: biryani,
  },
  {
    id: "d14",
    name: "Malai Broccoli",
    description: "Cheddar and cream marinade, finished in the clay oven.",
    price: 359,
    veg: true,
    category: "Kebabs",
    restaurantId: "tandoor-tales",
    image: biryani,
  },
];

export type Coupon = {
  code: string;
  label: string;
  type: "percent" | "flat" | "delivery";
  value: number;
  cap: number;
  minOrder: number;
};

/** No built-in offers — the only offers customers see are the ones the admin turns on. */
export const coupons: Coupon[] = [];

export const reviews = [
  {
    name: "Ananya M.",
    area: "HSR Layout",
    text: "Ordered at 11:40pm on a weekday and the biryani arrived still steaming. The tracking screen was accurate to the minute.",
    rating: 5,
  },
  {
    name: "Vikram R.",
    area: "Indiranagar",
    text: "I run a small café and joined as a partner. Payouts are clean and the order dashboard is the least annoying one I have used.",
    rating: 5,
  },
  {
    name: "Fatima S.",
    area: "Jayanagar",
    text: "Reordering my usual takes two taps. Coupons actually apply instead of quietly failing at checkout.",
    rating: 4,
  },
];

export const getRestaurant = (slug: string) => restaurants.find((r) => r.slug === slug);
export const dishesFor = (restaurantId: string) => dishes.filter((d) => d.restaurantId === restaurantId);
export const restaurantById = (id: string) => restaurants.find((r) => r.id === id);