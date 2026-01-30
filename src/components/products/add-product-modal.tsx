"use client";

import { useState, useCallback } from "react";
import { X, Link2, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

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

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

type Step = "url" | "form";

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

export function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
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

  const createProduct = useMutation(api.products.create);
  const { toast } = useToast();

  const resetForm = useCallback(() => {
    setStep("url");
    setUrl("");
    setIsLoading(false);
    setScrapeError(null);
    setFormData({
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
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleScrapeUrl = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setScrapeError(null);

    try {
      // For now, we'll do basic scraping. In production, this would call a serverless function
      // that uses a proper scraping library or service
      const response = await fetch("/api/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to scrape product data");
      }

      const data = await response.json();

      setFormData({
        name: data.name || "",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        sourceUrl: url.trim(),
        price: data.price?.toString() || "",
        currency: data.currency || "USD",
        category: "",
        roomType: "",
        style: "",
      });

      setStep("form");
    } catch {
      // If scraping fails, allow manual entry
      setScrapeError("Could not automatically extract product data. You can enter it manually.");
      setFormData({
        ...formData,
        sourceUrl: url.trim(),
      });
      setStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    setFormData({
      ...formData,
      sourceUrl: url.trim(),
    });
    setStep("form");
  };

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
      await createProduct({
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
        title: "Product added",
        description: `"${formData.name}" has been added to your library.`,
        type: "success",
      });

      onProductAdded?.();
      handleClose();
    } catch (error) {
      toast({
        title: "Failed to add product",
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
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-xl font-semibold text-neutral-900">Add Product</h2>

        {step === "url" ? (
          <div className="mt-4">
            <p className="text-sm text-neutral-600">
              Enter a product URL to automatically extract product information, or add manually.
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Product URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <button
                  onClick={handleScrapeUrl}
                  disabled={!url.trim() || isLoading}
                  className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch"
                  )}
                </button>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-neutral-500">or</span>
              </div>
            </div>

            <button
              onClick={handleManualEntry}
              className="w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Add manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            {scrapeError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>{scrapeError}</p>
              </div>
            )}

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
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Currency
                </label>
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
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Category
                </label>
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
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Room Type
                </label>
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
                onClick={() => setStep("url")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
