"use client";

import { memo, useState, useRef, useEffect } from "react";
import { NodeProps, Handle, Position, NodeResizer } from "@xyflow/react";
import { ExternalLink, Package, X } from "lucide-react";

export interface ProductNodeData {
  imageUrl?: string;
  name?: string;
  price?: number;
  currency?: string;
  sourceUrl?: string;
}

function ProductNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as ProductNodeData;
  const [imageError, setImageError] = useState(false);
  const previousUrlRef = useRef<string | undefined>(undefined);

  // Reset imageError when URL changes
  useEffect(() => {
    if (nodeData.imageUrl !== previousUrlRef.current) {
      setImageError(false);
      previousUrlRef.current = nodeData.imageUrl;
    }
  }, [nodeData.imageUrl]);

  const formatPrice = (price: number, currency?: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  const handleOpenSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.sourceUrl) {
      window.open(nodeData.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <NodeResizer
        minWidth={150}
        minHeight={180}
        isVisible={selected}
        lineClassName="border-primary-500"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary-500 bg-white"
      />

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-primary-400 !bg-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-primary-400 !bg-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-primary-400 !bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-primary-400 !bg-white"
      />

      <div
        className={`flex h-full min-h-[180px] min-w-[150px] flex-col overflow-hidden rounded-xl bg-white shadow-soft-md transition-shadow ${
          selected ? "ring-2 ring-primary-500 shadow-soft-lg" : ""
        }`}
      >
        {/* Product image */}
        <div className="relative flex-1 bg-neutral-100">
          {nodeData.imageUrl && !imageError ? (
            <img
              src={nodeData.imageUrl}
              alt={nodeData.name || "Product image"}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              {imageError ? <X className="h-8 w-8" /> : <Package className="h-8 w-8" />}
            </div>
          )}

          {/* Product link indicator */}
          {nodeData.sourceUrl && (
            <button
              onClick={handleOpenSource}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"
              title="Open product link"
            >
              <ExternalLink className="h-3.5 w-3.5 text-neutral-600" />
            </button>
          )}
        </div>

        {/* Product info */}
        <div className="border-t border-neutral-100 p-2">
          {nodeData.name && (
            <p className="truncate text-xs font-medium text-neutral-900">{nodeData.name}</p>
          )}
          {nodeData.price !== undefined && (
            <p className="mt-0.5 text-xs text-neutral-500">
              {formatPrice(nodeData.price, nodeData.currency)}
            </p>
          )}
          {!nodeData.name && !nodeData.price && (
            <p className="text-xs text-neutral-400">No product info</p>
          )}
        </div>
      </div>
    </>
  );
}

export const ProductNode = memo(ProductNodeComponent);
