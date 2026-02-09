import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./auth-helpers";
import { enforceSubscriptionLimit } from "./subscriptions";

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

    // Enforce subscription limits
    await enforceSubscriptionLimit(ctx, user._id, "add_product");

    // Validate and trim name
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Product name is required");
    }

    const now = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productData: any = {
      userId: user._id,
      name: trimmedName,
      currency: args.currency || "USD",
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    };
    if (args.description !== undefined) productData.description = args.description;
    if (args.imageUrl !== undefined) productData.imageUrl = args.imageUrl;
    if (args.sourceUrl !== undefined) productData.sourceUrl = args.sourceUrl;
    if (args.price !== undefined) productData.price = args.price;
    if (args.category !== undefined) productData.category = args.category;
    if (args.roomType !== undefined) productData.roomType = args.roomType;
    if (args.style !== undefined) productData.style = args.style;
    if (args.tags !== undefined) productData.tags = args.tags;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productId = await (ctx.db as any).insert("products", productData);

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

    // Validate and trim name if provided
    let cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;

      if (key === "name") {
        const trimmedName = (value as string).trim();
        if (!trimmedName) {
          throw new Error("Product name is required");
        }
        cleanUpdates[key] = trimmedName;
      } else {
        cleanUpdates[key] = value;
      }
    }

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
    const user = await getAuthenticatedUser(ctx);
    const product = await ctx.db.get(args.id);

    if (!product) {
      return null;
    }

    // Check if user owns the product or if it's public
    if (product.userId !== user._id && !product.isPublic) {
      throw new Error("Not authorized to view this product");
    }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredProducts.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results = results.filter((p: any) => {
        const price = p.price as number | undefined;
        if (price === undefined) return false;
        if (args.minPrice !== undefined && price < args.minPrice) return false;
        if (args.maxPrice !== undefined && price > args.maxPrice) return false;
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

    // Get user's products using index
    const myProducts = await ctx.db
      .query("products")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    let allProducts = myProducts;

    // If not filtering to only user's products, include public products using index
    if (!args.onlyMine) {
      // Use by_isPublic index to efficiently get public products
      const publicProducts = await ctx.db
        .query("products")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
        .collect();

      // Filter out user's own products from public list to avoid duplicates
      const otherPublicProducts = publicProducts.filter(
        (p) => p.userId !== user._id
      );
      allProducts = [...myProducts, ...otherPublicProducts];
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredProducts = filteredProducts.filter((p: any) => {
        const price = p.price as number | undefined;
        return price !== undefined && price >= args.minPrice!;
      });
    }
    if (args.maxPrice !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredProducts = filteredProducts.filter((p: any) => {
        const price = p.price as number | undefined;
        return price !== undefined && price <= args.maxPrice!;
      });
    }

    // Sort by creation date descending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredProducts.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

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
      const category = String(product.category || "");
      const roomType = String(product.roomType || "");
      const style = String(product.style || "");
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
      if (roomType) {
        roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1;
      }
      if (style) {
        styleCounts[style] = (styleCounts[style] || 0) + 1;
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
