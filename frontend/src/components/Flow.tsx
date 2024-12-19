'use client';
import { useCallback, useState, useEffect, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  SelectionMode,
  type OnConnect,
} from "@xyflow/react";
import * as Soundfont from 'soundfont-player';
import { chordMap } from "@/constants/constants";
import { initialNodes, nodeTypes, type CustomNodeType } from "./nodes";
import { initialEdges, edgeTypes, type CustomEdgeType } from "./edges";

import "@xyflow/react/dist/style.css";

// Function to map chord symbols to MIDI notes
const chordToNotes = (chord: string) => {
  return chordMap[chord] || []; // Return an empty array if chord is not found
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [instrument, setInstrument] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // To prevent multiple rapid key presses
  const [inputValue, setInputValue] = useState(''); // To store user input

  // Initialize the AudioContext and SoundFont instrument
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext initialized');
    }

    const loadInstrument = async () => {
      const audioContext = audioContextRef.current!;
      const loadedInstrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');
      setInstrument(loadedInstrument);
    };

    if (audioContextRef.current && !instrument) {
      loadInstrument();
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        console.log('AudioContext will not be closed here');
      }
    };
  }, [instrument]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const onSelectionChange = useCallback((elements: { nodes: Node[]; edges: Edge[] }) => {
    const sortedNodes = [...elements.nodes].sort((a, b) => a.position.x - b.position.x);
    setSelectedNodes(sortedNodes);
  }, []);

  // Handle key press to trigger chord playback
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isPlaying) {
        setIsPlaying(true); // Prevent multiple rapid key presses
        await playChords(selectedNodes, audioContextRef); // Play chords
        setIsPlaying(false); // Reset after playback
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedNodes, isPlaying]);

  // Handle text input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Handle submit button click to create nodes from input
  const handleSubmit = () => {
    // Split the input string by commas, trim spaces, and ensure non-empty values
    const chordList = inputValue.split(',').map(chord => chord.trim()).filter(chord => chord.length > 0);
    console.log('Chord List:', chordList);
    // Create nodes where each node's `chordSequence` is an array containing one chord
    const highestNodeId = Math.max(...nodes.map(node => parseInt(node.id, 10)), 0); // Default to 0 if no nodes exist
    const newNodes = chordList.map((chord, index) => ({
      id: `${highestNodeId+ index + 1}`,
      type: 'textUpdater', // or any other custom node type
      position: { x: index * 150, y: 100 }, // Adjust positions as needed
      data: { chordSequence: [chord] }, // `chordSequence` is now an array like ['G'], ['Cmaj7'], ['Am']
      style: { backgroundColor: "#ffffff", color: "white", borderColor: "white" }
    }));
    
  
    // Update the nodes state
    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
  };

  return (
    <>
      <div>
        <input 
          type="text" 
          value={inputValue} 
          onChange={handleInputChange} 
          placeholder="Enter chords separated by commas (e.g., Cmaj7, Dm7, G7)" 
          className="p-2 border rounded" 
        />
        <button 
          onClick={handleSubmit} 
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </div>

      <ReactFlow<CustomNodeType, CustomEdgeType>
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onSelectionChange={onSelectionChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        style={{ backgroundColor: '#e0f2fb' }}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        fitView
      >
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          
        </div>
      </ReactFlow>
    </>
  );
}

// Utility function to play chords
export const playChords = async (selectedNodes: Node[], audioContextRef: React.RefObject<AudioContext | null>) => {
  if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
    console.error('AudioContext is closed. Cannot play sound.');
    return;
  }

  const audioContext = audioContextRef.current;
  const instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');

  let currentTime = audioContext.currentTime; // Initial current time in seconds

  for (let node of selectedNodes) {
    const chordSequence = node.data.chordSequence;
    const notes = chordToNotes(chordSequence); // Convert chord symbol to MIDI notes

    if (notes.length > 0) {
      console.log(`Playing chord: ${chordSequence}, Notes: ${notes}`);
      
      // Schedule all notes of the chord to be played at the same time (currentTime)
      instrument.schedule(currentTime, notes.map(note => ({ note, duration: 2 }))); // Duration of 2 seconds for the chord
      
      // After scheduling the current chord, advance time by the duration of the chord (e.g., 2 seconds)
      currentTime += 2;
    }
  }
};
