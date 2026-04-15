// Import all assets needed for products
import na1 from "../assets/newarrive/1.webp";
import na2 from "../assets/newarrive/2.webp";
import na3 from "../assets/newarrive/3.webp";
import na4 from "../assets/newarrive/4.webp";
import na5 from "../assets/newarrive/5.webp";
import na6 from "../assets/newarrive/6.webp";

import idea1 from "../assets/design/idea_1.png";
import idea2 from "../assets/design/idea_2.png";
import idea3 from "../assets/design/idea_3.png";
import idea4 from "../assets/design/idea_4.png";
import idea5 from "../assets/design/idea_5.png";

import { regionData } from "./country";

// Extract regional products to be used in the all-products pool
const regionalProducts = Object.values(regionData).flatMap(region => region.products);

export const ALL_PRODUCTS = [
  // New Arrivals (IDs 101-106)
  { id: "101", name: "Just a Simple Grandpa Who Loves Cycling", price: "€21.99", image: na1, label: "Classic Unisex T-shirt", category: "arrival" },
  { id: "102", name: "Just a Simple Grandpa Who Loves Fishing", price: "€22.50", image: na2, label: "Classic Unisex T-shirt", category: "arrival" },
  { id: "103", name: "Best Grandpa & Cycling Enthusiast", price: "€19.99", image: na3, label: "Classic Unisex T-shirt", category: "arrival" },
  { id: "104", name: "Just a Simple Grandpa Who Loves Motorcycles", price: "€23.99", image: na4, label: "Classic Unisex T-shirt", category: "arrival" },
  { id: "105", name: "Don't Disturb Me: F1 in Progress", price: "€20.95", image: na5, label: "Classic Unisex T-shirt", category: "arrival" },
  { id: "106", name: "World's Best Outdoorsman", price: "€18.99", image: na6, label: "Classic Unisex T-shirt", category: "arrival" },

  // Design Ideas (idea-1 to idea-5) - kept for data consistency even if not linked
  { id: "idea-1", name: "Western Truck Edition", price: "€21.99", image: idea1, category: "design", label: "Premium Concept" },
  { id: "idea-2", name: "Outdoor Adventure Retro", price: "€22.99", image: idea2, category: "design", label: "Premium Concept" },
  { id: "idea-3", name: "Camp Vibes Only Premium", price: "€21.50", image: idea3, category: "design", label: "Premium Concept" },
  { id: "idea-4", name: "Tennis Club Urban", price: "€20.00", image: idea4, category: "design", label: "Premium Concept" },
  { id: "idea-5", name: "Cowboy Wood Hero Austin", price: "€23.00", image: idea5, category: "design", label: "Premium Concept" },

  // Flattened Regional products from country.js
  ...regionalProducts.map(p => ({
    ...p,
    id: String(p.id), // Ensure string format
    category: "collection"
  }))
];

export const getProductById = (id) => ALL_PRODUCTS.find(p => p.id === String(id));
