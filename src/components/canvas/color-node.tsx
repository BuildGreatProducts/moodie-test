"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { NodeProps, Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";
import { Palette, Copy, Check } from "lucide-react";

export interface ColorNodeData {
  color?: string;
  name?: string;
}

function ColorNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as ColorNodeData;
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(nodeData.name || "");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  const color = nodeData.color || "#94A3B8"; // Default neutral color

  // Sync local name state with external updates (e.g., undo/redo)
  useEffect(() => {
    if (!isEditingName) {
      setName(nodeData.name || "");
    }
  }, [nodeData.name, isEditingName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  // Save name to node data
  const saveName = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, name },
          };
        }
        return node;
      })
    );
  }, [id, name, setNodes]);

  const handleBlur = () => {
    setIsEditingName(false);
    saveName();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditingName(false);
      saveName();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setName(nodeData.name || "");
    }
  };

  const handleCopyColor = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(color.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access may fail
    }
  };

  // Calculate if text should be light or dark based on background
  const getLuminance = (hex: string) => {
    const rgb = hex
      .replace("#", "")
      .match(/.{2}/g)
      ?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
    const [r, g, b] = rgb.map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const textColor = getLuminance(color) > 0.5 ? "#1F2937" : "#FFFFFF";

  return (
    <>
      <NodeResizer
        minWidth={80}
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
        className={`flex h-full min-h-[100px] min-w-[80px] flex-col overflow-hidden rounded-xl shadow-soft-md transition-shadow ${
          selected ? "ring-2 ring-primary-500 shadow-soft-lg" : ""
        }`}
      >
        {/* Color swatch */}
        <div
          className="relative flex flex-1 items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {!nodeData.color && (
            <Palette className="h-6 w-6" style={{ color: textColor, opacity: 0.5 }} />
          )}

          {/* Copy button */}
          <button
            onClick={handleCopyColor}
            className="absolute right-2 top-2 rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/30"
            title="Copy color code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" style={{ color: textColor }} />
            ) : (
              <Copy className="h-3.5 w-3.5" style={{ color: textColor }} />
            )}
          </button>
        </div>

        {/* Color info */}
        <div className="border-t border-neutral-100 bg-white p-2">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-xs font-medium text-neutral-900 outline-none"
              placeholder="Color name"
            />
          ) : (
            <p
              onDoubleClick={handleDoubleClick}
              className="cursor-text truncate text-xs font-medium text-neutral-900"
            >
              {name || "Unnamed"}
            </p>
          )}
          <p className="mt-0.5 font-mono text-[10px] text-neutral-500">{color.toUpperCase()}</p>
        </div>
      </div>
    </>
  );
}

export const ColorNode = memo(ColorNodeComponent);
