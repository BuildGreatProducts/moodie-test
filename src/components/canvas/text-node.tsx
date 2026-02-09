"use client";

import { memo, useState, useRef, useEffect } from "react";
import { NodeProps, Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";
import { StickyNote } from "lucide-react";

export interface TextNodeData {
  text?: string;
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
}

function TextNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(nodeData.text || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  const backgroundColor = nodeData.backgroundColor || "#FEF3C7"; // Default warm yellow

  // Sync local text state with external updates (e.g., undo/redo)
  useEffect(() => {
    if (!isEditing) {
      setText(nodeData.text || "");
    }
  }, [nodeData.text, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Update node data
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, text },
          };
        }
        return node;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setText(nodeData.text || "");
    }
  };

  const fontSizeClass =
    nodeData.fontSize === 12
      ? "text-xs"
      : nodeData.fontSize === 16
        ? "text-base"
        : nodeData.fontSize === 20
          ? "text-lg"
          : nodeData.fontSize === 24
            ? "text-xl"
            : "text-sm";

  const fontWeightClass =
    nodeData.fontWeight === "medium"
      ? "font-medium"
      : nodeData.fontWeight === "semibold"
        ? "font-semibold"
        : nodeData.fontWeight === "bold"
          ? "font-bold"
          : "font-normal";

  const textAlignClass =
    nodeData.textAlign === "center"
      ? "text-center"
      : nodeData.textAlign === "right"
        ? "text-right"
        : "text-left";

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={60}
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
        onDoubleClick={handleDoubleClick}
        className={`flex h-full min-h-[60px] min-w-[100px] flex-col rounded-lg p-3 shadow-soft-md transition-shadow ${
          selected ? "ring-2 ring-primary-500 shadow-soft-lg" : ""
        }`}
        style={{ backgroundColor }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`h-full w-full resize-none bg-transparent outline-none ${fontSizeClass} ${fontWeightClass} ${textAlignClass}`}
            placeholder="Type your note..."
          />
        ) : text ? (
          <p
            className={`whitespace-pre-wrap ${fontSizeClass} ${fontWeightClass} ${textAlignClass}`}
          >
            {text}
          </p>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-neutral-400">
            <StickyNote className="h-5 w-5" />
            <span className="text-xs">Double-click to edit</span>
          </div>
        )}
      </div>
    </>
  );
}

export const TextNode = memo(TextNodeComponent);
