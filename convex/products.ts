import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./auth-helpers";

// Categories, room types, and styles for filtering
export const PRODUCT_CATEGORIES = [
  "Furniture",
  "Lighting",
  "Textiles",
  "Decor",
  "Art",
  "Rugs",
  "Storage",
  "Outdoor",
] as const;

export const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Office",
  "Entryway",
  "Outdoor",
] as const;

export const STYLES = [
  "Modern",
  "Traditional",
  "Mid-Century",
  "Minimalist",
  "Industrial",
  "Bohemian",
  "Scandinavian",
  "Coastal",
  "Farmhouse",
  "Contemporary",
] as const;

// Create a new product
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    category: v.optional(v.string()),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      userId: user._id,
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      sourceUrl: args.sourceUrl,
      price: args.price,
      currency: args.currency || "USD",
      category: args.category,
      roomType: args.roomType,
      style: args.style,
      tags: args.tags,
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

// Update an existing product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    category: v.optional(v.string()),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== user._id) {
      throw new Error("Not authorized to update this product");
    }

    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(id, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a product
export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== user._id) {
      throw new Error("Not authorized to delete this product");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get a single product by ID
export const get = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  },
});

// List user's products with optional filtering
export const listMyProducts = query({
  args: {
    category: v.optional(v.string()),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const limit = args.limit ?? 20;

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id));

    const allProducts = await productsQuery.collect();

    // Apply filters in memory (Convex doesn't support compound filters on multiple indexes)
    let filteredProducts = allProducts;

    if (args.category) {
      filteredProducts = filteredProducts.filter((p) => p.category === args.category);
    }
    if (args.roomType) {
      filteredProducts = filteredProducts.filter((p) => p.roomType === args.roomType);
    }
    if (args.style) {
      filteredProducts = filteredProducts.filter((p) => p.style === args.style);
    }

    // Sort by creation date descending
    filteredProducts.sort((a, b) => b.createdAt - a.createdAt);

    // Apply cursor-based pagination
    let startIndex = 0;
    if (args.cursor) {
      const cursorIndex = filteredProducts.findIndex((p) => p._id === args.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
    const nextCursor = paginatedProducts.length === limit ? paginatedProducts[limit - 1]._id : null;

    return {
      products: paginatedProducts,
      nextCursor,
      totalCount: filteredProducts.length,
    };
  },
});

// Search products by name with optional filters
export const search = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const limit = args.limit ?? 20;

    // Use search index for name search
    let searchQuery = ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) => {
        let search = q.search("name", args.query);

        // Only show user's own products
        search = search.eq("userId", user._id);

        if (args.category) {
          search = search.eq("category", args.category);
        }
        if (args.roomType) {
          search = search.eq("roomType", args.roomType);
        }
        if (args.style) {
          search = search.eq("style", args.style);
        }

        return search;
      });

    let results = await searchQuery.take(limit * 2); // Get extra for price filtering

    // Apply price filter in memory
    if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      results = results.filter((p) => {
        if (p.price === undefined) return false;
        if (args.minPrice !== undefined && p.price < args.minPrice) return false;
        if (args.maxPrice !== undefined && p.price > args.maxPrice) return false;
        return true;
      });
    }

    return results.slice(0, limit);
  },
});

// Browse all products (user's own + public products)
export const browse = query({
  args: {
    category: v.optional(v.string()),
    roomType: v.optional(v.string()),
    style: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("products")),
    onlyMine: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const limit = args.limit ?? 20;

    // Get user's products
    const myProducts = await ctx.db
      .query("products")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    let allProducts = myProducts;

    // If not filtering to only user's products, include public products
    if (!args.onlyMine) {
      // Get all products and filter to public ones not owned by user
      const allDbProducts = await ctx.db.query("products").collect();
      const publicProducts = allDbProducts.filter(
        (p) => p.isPublic && p.userId !== user._id
      );
      allProducts = [...myProducts, ...publicProducts];
    }

    // Apply filters
    let filteredProducts = allProducts;

    if (args.category) {
      filteredProducts = filteredProducts.filter((p) => p.category === args.category);
    }
    if (args.roomType) {
      filteredProducts = filteredProducts.filter((p) => p.roomType === args.roomType);
    }
    if (args.style) {
      filteredProducts = filteredProducts.filter((p) => p.style === args.style);
    }
    if (args.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price !== undefined && p.price >= args.minPrice!
      );
    }
    if (args.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price !== undefined && p.price <= args.maxPrice!
      );
    }

    // Sort by creation date descending
    filteredProducts.sort((a, b) => b.createdAt - a.createdAt);

    // Apply cursor-based pagination
    let startIndex = 0;
    if (args.cursor) {
      const cursorIndex = filteredProducts.findIndex((p) => p._id === args.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
    const nextCursor = paginatedProducts.length === limit ? paginatedProducts[limit - 1]._id : null;

    return {
      products: paginatedProducts,
      nextCursor,
      totalCount: filteredProducts.length,
    };
  },
});

// Get product count for a user
export const getMyProductCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    return products.length;
  },
});

// Get filter options (categories, room types, styles with counts)
export const getFilterOptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    const categoryCounts: Record<string, number> = {};
    const roomTypeCounts: Record<string, number> = {};
    const styleCounts: Record<string, number> = {};

    for (const product of products) {
      if (product.category) {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
      }
      if (product.roomType) {
        roomTypeCounts[product.roomType] = (roomTypeCounts[product.roomType] || 0) + 1;
      }
      if (product.style) {
        styleCounts[product.style] = (styleCounts[product.style] || 0) + 1;
      }
    }

    return {
      categories: PRODUCT_CATEGORIES.map((cat) => ({
        value: cat,
        label: cat,
        count: categoryCounts[cat] || 0,
      })),
      roomTypes: ROOM_TYPES.map((room) => ({
        value: room,
        label: room,
        count: roomTypeCounts[room] || 0,
      })),
      styles: STYLES.map((style) => ({
        value: style,
        label: style,
        count: styleCounts[style] || 0,
      })),
    };
  },
});
