import foodChicken from "@/assets/food-chicken.jpg";
import foodRamen from "@/assets/food-ramen.jpg";
import foodSmoothie from "@/assets/food-smoothie.jpg";
import foodPork from "@/assets/food-pork.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import foodBurger from "@/assets/food-burger.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviews: number;
  distance: number; // km
  deliveryTime: { saver: number; express: number }; // minutes
  deliveryFee: { saver: number; express: number };
  isLocal: boolean;
  isNew?: boolean;
  tags: string[];
  menu: MenuItem[];
}

export const categories = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "rice", label: "Rice Meals", emoji: "🍚" },
  { id: "noodles", label: "Noodles", emoji: "🍜" },
  { id: "burger", label: "Burgers", emoji: "🍔" },
  { id: "sushi", label: "Japanese", emoji: "🍣" },
  { id: "healthy", label: "Healthy", emoji: "🥗" },
  { id: "dessert", label: "Desserts", emoji: "🍰" },
];

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Lola's Chicken House",
    image: foodChicken,
    cuisine: "rice",
    rating: 4.8,
    reviews: 324,
    distance: 0.8,
    deliveryTime: { saver: 25, express: 12 },
    deliveryFee: { saver: 15, express: 35 },
    isLocal: true,
    tags: ["Best Seller", "Support Local"],
    menu: [
      { id: "1a", name: "Grilled Chicken Rice", description: "Juicy grilled chicken thigh on steamed rice with pickled veggies", price: 89, image: foodChicken, popular: true },
      { id: "1b", name: "Adobo Chicken Rice", description: "Classic Filipino adobo with garlic rice", price: 79, image: foodChicken },
      { id: "1c", name: "Chicken Inasal", description: "Charcoal-grilled chicken with unlimited rice", price: 99, image: foodChicken, popular: true },
      { id: "1d", name: "Crispy Fried Chicken", description: "Golden fried chicken, 2 pieces with gravy", price: 109, image: foodChicken },
    ],
  },
  {
    id: "2",
    name: "Ramen Nagi Express",
    image: foodRamen,
    cuisine: "noodles",
    rating: 4.6,
    reviews: 518,
    distance: 1.2,
    deliveryTime: { saver: 30, express: 15 },
    deliveryFee: { saver: 20, express: 45 },
    isLocal: false,
    tags: ["Popular"],
    menu: [
      { id: "2a", name: "Spicy Miso Ramen", description: "Rich miso broth with chashu pork and soft-boiled egg", price: 199, image: foodRamen, popular: true },
      { id: "2b", name: "Tonkotsu Ramen", description: "Creamy pork bone broth, 12-hour slow cook", price: 189, image: foodRamen },
      { id: "2c", name: "Veggie Ramen", description: "Plant-based broth with tofu and mushrooms", price: 169, image: foodRamen },
    ],
  },
  {
    id: "3",
    name: "Green Bowl Co.",
    image: foodSmoothie,
    cuisine: "healthy",
    rating: 4.9,
    reviews: 156,
    distance: 0.5,
    deliveryTime: { saver: 20, express: 10 },
    deliveryFee: { saver: 10, express: 25 },
    isLocal: true,
    isNew: true,
    tags: ["New", "Support Local", "15-min delivery"],
    menu: [
      { id: "3a", name: "Acai Smoothie Bowl", description: "Topped with granola, fresh berries, and banana", price: 159, image: foodSmoothie, popular: true },
      { id: "3b", name: "Mango Protein Bowl", description: "Fresh mango, whey protein, chia seeds", price: 149, image: foodSmoothie },
      { id: "3c", name: "Green Detox Bowl", description: "Spirulina, avocado, spinach blend with coconut", price: 139, image: foodSmoothie },
    ],
  },
  {
    id: "4",
    name: "Kuya's Lechon Belly",
    image: foodPork,
    cuisine: "rice",
    rating: 4.7,
    reviews: 892,
    distance: 1.8,
    deliveryTime: { saver: 35, express: 18 },
    deliveryFee: { saver: 25, express: 50 },
    isLocal: true,
    tags: ["Best Seller", "Support Local"],
    menu: [
      { id: "4a", name: "Lechon Belly Rice", description: "Crispy pork belly with liver sauce and rice", price: 129, image: foodPork, popular: true },
      { id: "4b", name: "Sisig Rice", description: "Sizzling chopped pork face with egg", price: 109, image: foodPork },
      { id: "4c", name: "Liempo BBQ", description: "Sweet-marinated pork belly skewers with rice", price: 99, image: foodPork },
    ],
  },
  {
    id: "5",
    name: "Sakura Sushi Bar",
    image: foodSushi,
    cuisine: "sushi",
    rating: 4.5,
    reviews: 267,
    distance: 2.1,
    deliveryTime: { saver: 40, express: 20 },
    deliveryFee: { saver: 30, express: 55 },
    isLocal: false,
    tags: ["Premium"],
    menu: [
      { id: "5a", name: "Salmon Nigiri Set", description: "8 pieces of fresh salmon nigiri", price: 299, image: foodSushi, popular: true },
      { id: "5b", name: "California Maki", description: "Classic crab stick and avocado roll, 8 pcs", price: 199, image: foodSushi },
      { id: "5c", name: "Sashimi Platter", description: "Assorted fresh sashimi, 12 slices", price: 399, image: foodSushi },
    ],
  },
  {
    id: "6",
    name: "Patty Shack",
    image: foodBurger,
    cuisine: "burger",
    rating: 4.4,
    reviews: 743,
    distance: 1.0,
    deliveryTime: { saver: 28, express: 14 },
    deliveryFee: { saver: 15, express: 35 },
    isLocal: true,
    tags: ["Support Local", "Budget Friendly"],
    menu: [
      { id: "6a", name: "Classic Smash Burger", description: "Double smashed patty with American cheese and special sauce", price: 139, image: foodBurger, popular: true },
      { id: "6b", name: "Bacon BBQ Burger", description: "Crispy bacon, BBQ sauce, cheddar cheese", price: 169, image: foodBurger },
      { id: "6c", name: "Mushroom Swiss", description: "Sautéed mushrooms and melted Swiss cheese", price: 159, image: foodBurger },
      { id: "6d", name: "Fries & Drink Combo", description: "Large fries and regular drink", price: 69, image: foodBurger },
    ],
  },
];
