"use client";

import { memo, useState, useEffect } from "react";
import { ExternalLink, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export interface ProductCardData {
  _id: Id<"products">;
  name: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  price?: number;
  currency?: string;
  category?: string;
  roomType?: string;
  style?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  onEdit?: (product: ProductCardData) => void;
  onDelete?: (productId: Id<"products">) => void;
  onDragStart?: (e: React.DragEvent, product: ProductCardData) => void;
  onDoubleClick?: (product: ProductCardData) => void;
  showActions?: boolean;
}

function ProductCardComponent({
  product,
  onEdit,
  onDelete,
  onDragStart,
  onDoubleClick,
  showActions = true,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Reset imageError when product.imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [product.imageUrl]);

  const formatPrice = (price: number, currency?: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(price);
    } catch {
      // Fallback for invalid currency codes
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, product);
    }
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(product);
    }
  };

  const handleOpenSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.sourceUrl) {
      window.open(product.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(product._id);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      className="group relative flex cursor-grab flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-soft-sm transition-all hover:shadow-soft-md active:cursor-grabbing"
    >
      {/* Drag handle indicator */}
      <div className="absolute left-1 top-1 z-10 rounded bg-white/80 p-0.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <GripVertical className="h-3.5 w-3.5 text-neutral-400" />
      </div>

      {/* Product image */}
      <div className="relative aspect-square bg-neutral-100">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Source link button */}
        {product.sourceUrl && (
          <button
            onClick={handleOpenSource}
            className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
            title="Open product link"
          >
            <ExternalLink className="h-3 w-3 text-neutral-600" />
          </button>
        )}

        {/* Actions menu */}
        {showActions && (onEdit || onDelete) && (
          <div className="absolute right-1.5 bottom-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
            >
              <MoreVertical className="h-3 w-3 text-neutral-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full z-20 mb-1 min-w-[120px] rounded-lg border border-neutral-200 bg-white py-1 shadow-soft-md">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-0.5 p-2">
        <h4 className="truncate text-xs font-medium text-neutral-900">{product.name}</h4>
        {product.price !== undefined && (
          <p className="text-xs text-neutral-500">
            {formatPrice(product.price, product.currency)}
          </p>
        )}
        {product.category && (
          <p className="truncate text-[10px] text-neutral-400">{product.category}</p>
        )}
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
