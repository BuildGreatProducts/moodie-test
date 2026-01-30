"use client";

import { memo, useState, useEffect, useRef } from "react";
import { NodeProps, Handle, Position, NodeResizer } from "@xyflow/react";
import { ImageIcon, X } from "lucide-react";

export interface ImageNodeData {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  isBlobUrl?: boolean;
}

function ImageNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  const [imageError, setImageError] = useState(false);
  const [blobRevoked, setBlobRevoked] = useState(false);
  const previousUrlRef = useRef<string | undefined>(undefined);

  // Reset imageError when URL changes
  useEffect(() => {
    if (nodeData.url !== previousUrlRef.current) {
      setImageError(false);
      setBlobRevoked(false);
      previousUrlRef.current = nodeData.url;
    }
  }, [nodeData.url]);

  // Handle image load - revoke blob URL after successful load
  const handleImageLoad = () => {
    if (nodeData.isBlobUrl && nodeData.url && !blobRevoked) {
      // Revoke the blob URL since the image is now loaded into memory
      URL.revokeObjectURL(nodeData.url);
      setBlobRevoked(true);
    }
  };

  // Cleanup blob URL on unmount if not yet revoked
  useEffect(() => {
    return () => {
      if (nodeData.isBlobUrl && nodeData.url && !blobRevoked) {
        URL.revokeObjectURL(nodeData.url);
      }
    };
  }, [nodeData.isBlobUrl, nodeData.url, blobRevoked]);

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={100}
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
        className={`flex h-full min-h-[100px] min-w-[100px] items-center justify-center overflow-hidden rounded-xl bg-white shadow-soft-md transition-shadow ${
          selected ? "ring-2 ring-primary-500 shadow-soft-lg" : ""
        }`}
      >
        {nodeData.url && !imageError ? (
          <img
            src={nodeData.url}
            alt={nodeData.alt || "Moodboard image"}
            className="h-full w-full object-cover"
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-neutral-400">
            {imageError ? (
              <>
                <X className="h-8 w-8" />
                <span className="text-xs">Failed to load</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">No image</span>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export const ImageNode = memo(ImageNodeComponent);
