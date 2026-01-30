"use client";

import { useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";

interface UseCanvasHistoryOptions {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  maxHistory?: number;
}

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useCanvasHistory({
  nodes,
  edges,
  setNodes,
  setEdges,
  maxHistory = 50,
}: UseCanvasHistoryOptions) {
  const historyRef = useRef<HistoryState[]>([]);
  const currentIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  // Push current state to history
  const pushState = useCallback(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    // Remove any future states if we're not at the end
    if (currentIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    }

    // Add new state
    historyRef.current.push(newState);
    currentIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > maxHistory) {
      historyRef.current.shift();
      currentIndexRef.current--;
    }
  }, [nodes, edges, maxHistory]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndexRef.current <= 0) return;

    // Save current state before undo if it's not already saved
    if (currentIndexRef.current === historyRef.current.length - 1) {
      const currentState: HistoryState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      };
      if (
        JSON.stringify(currentState) !==
        JSON.stringify(historyRef.current[currentIndexRef.current])
      ) {
        historyRef.current.push(currentState);
      }
    }

    currentIndexRef.current--;
    const previousState = historyRef.current[currentIndexRef.current];

    isUndoRedoRef.current = true;
    setNodes(JSON.parse(JSON.stringify(previousState.nodes)));
    setEdges(JSON.parse(JSON.stringify(previousState.edges)));
  }, [nodes, edges, setNodes, setEdges]);

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndexRef.current >= historyRef.current.length - 1) return;

    currentIndexRef.current++;
    const nextState = historyRef.current[currentIndexRef.current];

    isUndoRedoRef.current = true;
    setNodes(JSON.parse(JSON.stringify(nextState.nodes)));
    setEdges(JSON.parse(JSON.stringify(nextState.edges)));
  }, [setNodes, setEdges]);

  const canUndo = currentIndexRef.current > 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
