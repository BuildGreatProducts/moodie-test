"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { ProductCard, ProductCardData } from "./product-card";
import { ProductFilters } from "./product-filters";
import { AddProductModal } from "./add-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

interface ProductLibraryPanelProps {
  onAddProductToCanvas?: (product: ProductCardData) => void;
}

export function ProductLibraryPanel({ onAddProductToCanvas }: ProductLibraryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string | undefined>();
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCardData | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<Id<"products"> | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Queries
  const filterOptions = useQuery(api.products.getFilterOptions);

  const browseResults = useQuery(
    api.products.browse,
    debouncedSearch
      ? undefined // Use search when there's a query
      : {
          category: selectedCategory,
          roomType: selectedRoomType,
          style: selectedStyle,
          minPrice,
          maxPrice,
          onlyMine: activeTab === "my",
          limit: 50,
        }
  );

  const searchResults = useQuery(
    api.products.search,
    debouncedSearch
      ? {
          query: debouncedSearch,
          category: selectedCategory,
          roomType: selectedRoomType,
          style: selectedStyle,
          minPrice,
          maxPrice,
          limit: 50,
        }
      : "skip"
  );

  const products = debouncedSearch ? searchResults : browseResults?.products;
  const isLoading = products === undefined;

  const deleteProduct = useMutation(api.products.remove);

  // Handlers
  const handleDragStart = useCallback((e: React.DragEvent, product: ProductCardData) => {
    e.dataTransfer.setData("application/reactflow/type", "product");
    e.dataTransfer.setData(
      "application/reactflow/data",
      JSON.stringify({
        imageUrl: product.imageUrl,
        name: product.name,
        price: product.price,
        currency: product.currency,
        sourceUrl: product.sourceUrl,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDoubleClick = useCallback(
    (product: ProductCardData) => {
      if (onAddProductToCanvas) {
        onAddProductToCanvas(product);
      }
    },
    [onAddProductToCanvas]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingProductId) return;

    try {
      await deleteProduct({ id: deletingProductId });
      toast({
        title: "Product deleted",
        description: "The product has been removed from your library.",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setDeletingProductId(null);
    }
  }, [deletingProductId, deleteProduct, toast]);

  const handleClearAllFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setSelectedRoomType(undefined);
    setSelectedStyle(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchQuery("");
  }, []);

  const panelWidth = isExpanded ? "w-80" : "w-12";

  return (
    <>
      <div
        className={`flex h-full flex-col border-l border-neutral-200 bg-white transition-all duration-300 ${panelWidth}`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-1 shadow-soft-sm transition-colors hover:bg-neutral-50"
        >
          {isExpanded ? (
            <ChevronRight className="h-4 w-4 text-neutral-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          )}
        </button>

        {isExpanded ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <h3 className="font-display text-base font-semibold text-neutral-900">Products</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab("browse")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === "browse"
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === "my"
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                My Products
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-neutral-200 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-neutral-200 py-1.5 pl-8 pr-8 text-sm outline-none transition-colors focus:border-primary-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            {filterOptions && (
              <div className="border-b border-neutral-200 p-3">
                <ProductFilters
                  categories={filterOptions.categories}
                  roomTypes={filterOptions.roomTypes}
                  styles={filterOptions.styles}
                  selectedCategory={selectedCategory}
                  selectedRoomType={selectedRoomType}
                  selectedStyle={selectedStyle}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={setSelectedCategory}
                  onRoomTypeChange={setSelectedRoomType}
                  onStyleChange={setSelectedStyle}
                  onPriceChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}

            {/* Product grid */}
            <div className="flex-1 overflow-auto p-3">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product as ProductCardData}
                      onDragStart={handleDragStart}
                      onDoubleClick={handleDoubleClick}
                      onEdit={setEditingProduct}
                      onDelete={setDeletingProductId}
                      showActions={activeTab === "my"}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-10 w-10 text-neutral-300" />
                  <p className="mt-2 text-sm font-medium text-neutral-600">No products found</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {activeTab === "my"
                      ? "Add your first product to get started"
                      : "Try adjusting your filters or search"}
                  </p>
                  {activeTab === "my" && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Product
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer with count */}
            {products && products.length > 0 && (
              <div className="border-t border-neutral-200 px-3 py-2">
                <p className="text-xs text-neutral-500">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                  {browseResults?.totalCount && browseResults.totalCount > products.length && (
                    <span> of {browseResults.totalCount}</span>
                  )}
                </p>
              </div>
            )}
          </>
        ) : (
          // Collapsed state
          <div className="flex flex-col items-center gap-2 py-4">
            <button
              onClick={() => setIsExpanded(true)}
              className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
              title="Products"
            >
              <Package className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={() => {
          // Products will auto-refresh via Convex reactivity
        }}
      />

      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={() => {
            setEditingProduct(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingProductId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProductId(null)}
        variant="danger"
      />
    </>
  );
}
