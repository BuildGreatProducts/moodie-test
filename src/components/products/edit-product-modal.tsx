"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ImageIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { ProductCardData } from "./product-card";

const CATEGORIES = [
  "Furniture",
  "Lighting",
  "Textiles",
  "Decor",
  "Art",
  "Rugs",
  "Storage",
  "Outdoor",
];

const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Office",
  "Entryway",
  "Outdoor",
];

const STYLES = [
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
];

interface EditProductModalProps {
  isOpen: boolean;
  product: ProductCardData;
  onClose: () => void;
  onProductUpdated?: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  price: string;
  currency: string;
  category: string;
  roomType: string;
  style: string;
}

export function EditProductModal({
  isOpen,
  product,
  onClose,
  onProductUpdated,
}: EditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    imageUrl: "",
    sourceUrl: "",
    price: "",
    currency: "USD",
    category: "",
    roomType: "",
    style: "",
  });

  const updateProduct = useMutation(api.products.update);
  const { toast } = useToast();

  // Initialize form data from product
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        sourceUrl: product.sourceUrl || "",
        price: product.price?.toString() || "",
        currency: product.currency || "USD",
        category: product.category || "",
        roomType: product.roomType || "",
        style: product.style || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a product name.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateProduct({
        id: product._id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        sourceUrl: formData.sourceUrl.trim() || undefined,
        price: formData.price ? Number(formData.price) : undefined,
        currency: formData.currency || undefined,
        category: formData.category || undefined,
        roomType: formData.roomType || undefined,
        style: formData.style || undefined,
      });

      toast({
        title: "Product updated",
        description: `"${formData.name}" has been updated.`,
        type: "success",
      });

      onProductUpdated?.();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-soft-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-xl font-semibold text-neutral-900">Edit Product</h2>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                required
              />
            </div>

            {/* Image URL */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                {formData.imageUrl && (
                  <div className="relative h-10 w-10 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <ImageIcon className="absolute inset-0 m-auto h-4 w-4 text-neutral-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Source URL */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Source URL
              </label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="https://example.com/product"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {/* Price and Currency */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Room Type</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select room</option>
                {ROOM_TYPES.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Style</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select style</option>
                {STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
                className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
