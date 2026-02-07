"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Node as FlowNode } from "@xyflow/react";
import {
  ImagePlus,
  Type,
  Palette,
  Package,
  Undo2,
  Redo2,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ChevronDown,
  Upload,
  Sparkles,
  Share2,
  MessageSquare,
} from "lucide-react";

interface CanvasToolbarProps {
  onAddNode: (type: string, data?: Record<string, unknown>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  selectedNodes: string[];
  nodes: FlowNode[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  onToggleAI?: () => void;
  isAIOpen?: boolean;
  onShare?: () => void;
  commentCount?: { total: number; unresolved: number };
  onToggleComments?: () => void;
  isCommentsOpen?: boolean;
}

export function CanvasToolbar({
  onAddNode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  snapToGrid,
  onToggleSnap,
  selectedNodes,
  nodes,
  setNodes,
  onToggleAI,
  isAIOpen,
  onShare,
  commentCount,
  onToggleComments,
  isCommentsOpen,
}: CanvasToolbarProps) {
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const alignToggleRef = useRef<HTMLButtonElement>(null);

  // Click-outside handler for alignment menu
  useEffect(() => {
    if (!showAlignMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as globalThis.Node;
      const isOutsideMenu = alignMenuRef.current && !alignMenuRef.current.contains(target);
      const isOutsideToggle = alignToggleRef.current && !alignToggleRef.current.contains(target);

      if (isOutsideMenu && isOutsideToggle) {
        setShowAlignMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showAlignMenu]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Please upload a JPG, PNG, or WebP image.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be less than 10MB.");
        return;
      }

      // Create a local URL for the image with blob flag for cleanup
      const url = URL.createObjectURL(file);
      onAddNode("image", { url, alt: file.name, isBlobUrl: true });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onAddNode]
  );

  // Alignment functions
  const alignNodes = useCallback(
    (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
      if (selectedNodes.length < 2) return;

      const selected = nodes.filter((n) => selectedNodes.includes(n.id));
      const bounds = {
        minX: Math.min(...selected.map((n) => n.position.x)),
        maxX: Math.max(...selected.map((n) => n.position.x + (n.measured?.width || 100))),
        minY: Math.min(...selected.map((n) => n.position.y)),
        maxY: Math.max(...selected.map((n) => n.position.y + (n.measured?.height || 100))),
      };

      setNodes((nds) =>
        nds.map((node) => {
          if (!selectedNodes.includes(node.id)) return node;

          const width = node.measured?.width || 100;
          const height = node.measured?.height || 100;

          let newPosition = { ...node.position };

          switch (alignment) {
            case "left":
              newPosition.x = bounds.minX;
              break;
            case "center":
              newPosition.x = bounds.minX + (bounds.maxX - bounds.minX) / 2 - width / 2;
              break;
            case "right":
              newPosition.x = bounds.maxX - width;
              break;
            case "top":
              newPosition.y = bounds.minY;
              break;
            case "middle":
              newPosition.y = bounds.minY + (bounds.maxY - bounds.minY) / 2 - height / 2;
              break;
            case "bottom":
              newPosition.y = bounds.maxY - height;
              break;
          }

          return { ...node, position: newPosition };
        })
      );
    },
    [selectedNodes, nodes, setNodes]
  );

  const toolbarButtonClass =
    "flex items-center justify-center rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-600";
  const activeButtonClass =
    "flex items-center justify-center rounded-lg p-2 bg-primary-100 text-primary-700 transition-colors hover:bg-primary-200";

  return (
    <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 shadow-soft-md">
      {/* Add nodes group */}
      <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
        {/* Upload image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={toolbarButtonClass}
          title="Upload image"
        >
          <Upload className="h-5 w-5" />
        </button>

        {/* Add image (URL) */}
        <button
          onClick={() => onAddNode("image", {})}
          className={toolbarButtonClass}
          title="Add image"
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        {/* Add text note */}
        <button
          onClick={() => onAddNode("text", { text: "" })}
          className={toolbarButtonClass}
          title="Add text note"
        >
          <Type className="h-5 w-5" />
        </button>

        {/* Add color swatch */}
        <button
          onClick={() => onAddNode("color", { color: "#94A3B8", name: "New Color" })}
          className={toolbarButtonClass}
          title="Add color swatch"
        >
          <Palette className="h-5 w-5" />
        </button>

        {/* Add product (placeholder) */}
        <button
          onClick={() => onAddNode("product", {})}
          className={toolbarButtonClass}
          title="Add product"
        >
          <Package className="h-5 w-5" />
        </button>
      </div>

      {/* Alignment group */}
      <div className="relative flex items-center gap-1 border-r border-neutral-200 pr-2">
        <button
          ref={alignToggleRef}
          onClick={() => setShowAlignMenu(!showAlignMenu)}
          disabled={selectedNodes.length < 2}
          className={toolbarButtonClass}
          title="Align selected elements"
        >
          <AlignLeft className="h-5 w-5" />
          <ChevronDown className="ml-0.5 h-3 w-3" />
        </button>

        {showAlignMenu && (
          <div
            ref={alignMenuRef}
            className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
          >
            <div className="mb-2 text-xs font-medium text-neutral-500">Horizontal</div>
            <div className="mb-3 flex gap-1">
              <button
                onClick={() => alignNodes("left")}
                className={toolbarButtonClass}
                title="Align left"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => alignNodes("center")}
                className={toolbarButtonClass}
                title="Align center"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => alignNodes("right")}
                className={toolbarButtonClass}
                title="Align right"
              >
                <AlignRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-2 text-xs font-medium text-neutral-500">Vertical</div>
            <div className="flex gap-1">
              <button
                onClick={() => alignNodes("top")}
                className={toolbarButtonClass}
                title="Align top"
              >
                <AlignStartVertical className="h-4 w-4" />
              </button>
              <button
                onClick={() => alignNodes("middle")}
                className={toolbarButtonClass}
                title="Align middle"
              >
                <AlignCenterVertical className="h-4 w-4" />
              </button>
              <button
                onClick={() => alignNodes("bottom")}
                className={toolbarButtonClass}
                title="Align bottom"
              >
                <AlignEndVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Undo/Redo group */}
      <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={toolbarButtonClass}
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="h-5 w-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={toolbarButtonClass}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="h-5 w-5" />
        </button>
      </div>

      {/* Grid snap toggle */}
      <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
        <button
          onClick={onToggleSnap}
          className={snapToGrid ? activeButtonClass : toolbarButtonClass}
          title={snapToGrid ? "Disable grid snap" : "Enable grid snap"}
        >
          <Grid3X3 className="h-5 w-5" />
        </button>
      </div>

      {/* Share and Comments group */}
      <div className="flex items-center gap-1 border-r border-neutral-200 pr-2">
        {onShare && (
          <button
            onClick={onShare}
            className={toolbarButtonClass}
            title="Share moodboard"
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
        {onToggleComments && (
          <button
            onClick={onToggleComments}
            className={isCommentsOpen ? activeButtonClass : toolbarButtonClass}
            title={isCommentsOpen ? "Close comments" : "View comments"}
          >
            <div className="relative">
              <MessageSquare className="h-5 w-5" />
              {commentCount && commentCount.unresolved > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-medium text-white">
                  {commentCount.unresolved > 9 ? "9+" : commentCount.unresolved}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* AI Assistant toggle */}
      {onToggleAI && (
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleAI}
            className={isAIOpen ? activeButtonClass : toolbarButtonClass}
            title={isAIOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <Sparkles className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
