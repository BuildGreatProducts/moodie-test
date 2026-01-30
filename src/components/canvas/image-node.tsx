"use client";

import { memo, useState } from "react";
import { NodeProps, Handle, Position, NodeResizer } from "@xyflow/react";
import { ImageIcon, X } from "lucide-react";

export interface ImageNodeData {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

function ImageNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  const [imageError, setImageError] = useState(false);

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
