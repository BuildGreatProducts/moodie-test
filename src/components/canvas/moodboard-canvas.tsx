"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  ReactFlowInstance,
  OnConnect,
  ConnectionMode,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ImageNode } from "./image-node";
import { ProductNode } from "./product-node";
import { TextNode } from "./text-node";
import { ColorNode } from "./color-node";
import { CanvasToolbar } from "./canvas-toolbar";
import { useCanvasHistory } from "@/hooks/use-canvas-history";
import { ProductLibraryPanel, ProductCardData } from "@/components/products";

// Custom node types
const nodeTypes: NodeTypes = {
  image: ImageNode,
  product: ProductNode,
  text: TextNode,
  color: ColorNode,
};

// Custom edge types (using defaults for now)
const edgeTypes: EdgeTypes = {};

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
}

interface MoodboardCanvasProps {
  initialState?: CanvasState;
  onStateChange?: (state: CanvasState) => void;
}

export function MoodboardCanvas({
  initialState,
  onStateChange,
}: MoodboardCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState?.edges || []);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // History for undo/redo
  const { pushState, undo, redo, canUndo, canRedo } = useCanvasHistory({
    nodes,
    edges,
    setNodes,
    setEdges,
  });

  // Notify parent of state changes (debounced in parent)
  const handleStateChange = useCallback(() => {
    if (!reactFlowInstance || !onStateChange) return;

    const viewport = reactFlowInstance.getViewport();
    onStateChange({
      nodes,
      edges,
      viewport,
    });
  }, [nodes, edges, reactFlowInstance, onStateChange]);

  // Trigger state change notification on changes
  useEffect(() => {
    handleStateChange();
  }, [nodes, edges, handleStateChange]);

  // Handle edge connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      pushState();
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#94A3B8", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges, pushState]
  );

  // Handle node changes with history
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      // Only push to history for significant changes (not position during drag)
      const hasSignificantChange = changes.some(
        (change) =>
          change.type === "remove" ||
          (change.type === "dimensions" && "resizing" in change && !change.resizing)
      );
      if (hasSignificantChange) {
        pushState();
      }
      onNodesChange(changes);
    },
    [onNodesChange, pushState]
  );

  // Handle edge changes with history
  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      const hasSignificantChange = changes.some((change) => change.type === "remove");
      if (hasSignificantChange) {
        pushState();
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, pushState]
  );

  // Handle selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodesList }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(selectedNodesList.map((n) => n.id));
    },
    []
  );

  // Handle drop for adding new nodes
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow/type");
      const data = event.dataTransfer.getData("application/reactflow/data");

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: data ? JSON.parse(data) : {},
      };

      pushState();
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, pushState]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Check if the active element is an editable field
  const isEditingText = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;

    // Check for input, textarea, or contenteditable elements
    if (activeElement instanceof HTMLInputElement) return true;
    if (activeElement instanceof HTMLTextAreaElement) return true;
    if ((activeElement as HTMLElement).isContentEditable) return true;

    // Check for elements with contenteditable attribute
    if (activeElement.getAttribute("contenteditable") === "true") return true;

    return false;
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip keyboard shortcuts when user is editing text
      if (isEditingText()) {
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if ((event.metaKey || event.ctrlKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (
        ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "z") ||
        ((event.metaKey || event.ctrlKey) && event.key === "y")
      ) {
        event.preventDefault();
        redo();
      }
      // Delete selected nodes (only when not editing)
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodes.length > 0) {
          event.preventDefault();
          pushState();
          setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
          setEdges((eds) =>
            eds.filter(
              (e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
            )
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedNodes, setNodes, setEdges, pushState, isEditingText]);

  // Add new node from toolbar
  const addNode = useCallback(
    (type: string, data: Record<string, unknown> = {}) => {
      if (!reactFlowInstance) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const position = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data,
      };

      pushState();
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, pushState]
  );

  // Add product from library panel (double-click)
  const handleAddProductToCanvas = useCallback(
    (product: ProductCardData) => {
      addNode("product", {
        imageUrl: product.imageUrl,
        name: product.name,
        price: product.price,
        currency: product.currency,
        sourceUrl: product.sourceUrl,
      });
    },
    [addNode]
  );

  return (
    <div className="flex h-full w-full">
      {/* Canvas Area */}
      <div ref={reactFlowWrapper} className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          selectionMode={SelectionMode.Partial}
          snapToGrid={snapToGrid}
          snapGrid={[15, 15]}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={4}
          deleteKeyCode={null}
          multiSelectionKeyCode={["Shift", "Meta", "Control"]}
          className="bg-neutral-50"
        >
          <Background color="#E5E7EB" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border-neutral-200 !bg-white !shadow-soft-md"
          />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "image":
                  return "#818CF8";
                case "product":
                  return "#34D399";
                case "text":
                  return "#FBBF24";
                case "color":
                  return (node.data as { color?: string })?.color || "#94A3B8";
                default:
                  return "#94A3B8";
              }
            }}
            maskColor="rgba(255, 255, 255, 0.8)"
            className="!rounded-lg !border-neutral-200 !bg-white !shadow-soft-md"
          />

          {/* Canvas Toolbar */}
          <Panel position="top-center">
            <CanvasToolbar
              onAddNode={addNode}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              snapToGrid={snapToGrid}
              onToggleSnap={() => setSnapToGrid(!snapToGrid)}
              selectedNodes={selectedNodes}
              nodes={nodes}
              setNodes={setNodes}
            />
          </Panel>
        </ReactFlow>
      </div>

      {/* Product Library Panel */}
      <div className="relative">
        <ProductLibraryPanel onAddProductToCanvas={handleAddProductToCanvas} />
      </div>
    </div>
  );
}
