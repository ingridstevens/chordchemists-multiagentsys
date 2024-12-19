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
import { initialNodes, nodeTypes, type CustomNodeType } from "./nodes2";
import { initialEdges, edgeTypes, type CustomEdgeType } from "./edges2";

import "@xyflow/react/dist/style.css";

// Function to map chord symbols to MIDI notes
const chordToNotes = (chord) => {
  return chordMap[chord] || [];
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const audioContextRef = useRef(null);
  const [instrument, setInstrument] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [fetchedChords, setFetchedChords] = useState([]);
  const nodeWidth = 150;
  const nodeHeight = 100;
  const maxColumns = 4;

  // Initialize AudioContext and SoundFont instrument
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const loadInstrument = async () => {
      const audioContext = audioContextRef.current;
      const loadedInstrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');
      setInstrument(loadedInstrument);
    };

    if (audioContextRef.current && !instrument) {
      loadInstrument();
    }
  }, [instrument]);

  const onConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const onSelectionChange = useCallback((elements) => {
    const sortedNodes = [...elements.nodes].sort((a, b) => a.position.x - b.position.x);
    setSelectedNodes(sortedNodes);
  }, []);

  // Handle key press for chord playback
  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.key === 'Enter' && !isPlaying) {
        setIsPlaying(true);
        await playChords(selectedNodes, audioContextRef);
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNodes, isPlaying]);

  // Updated fetchChords function to match the API endpoint
  const fetchChords = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('chord_sequence', inputValue);

      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chords');
      }

      const data = await response.json();
      // Parse the chord sequence from the specific API response format
      const chordSequence = data["chord_sequence:"];
      
      if (chordSequence) {
        const chords = chordSequence.split(',').map(chord => chord.trim());
        setFetchedChords(chords);
        handleFetchedChords(chords);
      }
    } catch (error) {
      console.error('Error fetching chords:', error);
    }
  };

  // Handle fetched chords and create nodes
  const handleFetchedChords = (chords) => {
    const highestNodeId = Math.max(...nodes.map(node => parseInt(node.id, 10)), 0);
    const newNodes = chords.map((chord, index) => {
      const row = Math.floor((nodes.length + index) / maxColumns);
      const column = (nodes.length + index) % maxColumns;

      return {
        id: `${highestNodeId + index + 1}`,
        type: 'textUpdater',
        position: {
          x: column * nodeWidth,
          y: row * nodeHeight,
        },
        data: { chordSequence: [chord] },
        style: { backgroundColor: "#ffffff", color: "white", borderColor: "white" }
      };
    });

    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    const chordList = inputValue.split(',').map(chord => chord.trim()).filter(chord => chord.length > 0);
    
    // Validate chords
    const validChords = chordList.filter(chord => chordMap[chord]);
    
    const highestNodeId = Math.max(...nodes.map(node => parseInt(node.id, 10)), 0);
    const newNodes = validChords.map((chord, index) => {
      const row = Math.floor((nodes.length + index) / maxColumns);
      const column = (nodes.length + index) % maxColumns;

      return {
        id: `${highestNodeId + index + 1}`,
        type: 'textUpdater',
        position: {
          x: column * nodeWidth,
          y: row * nodeHeight,
        },
        data: { chordSequence: [chord] },
        style: { backgroundColor: "#ffffff", color: "white", borderColor: "white" }
      };
    });

    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
  };

  return (
    <>
      <div className="flex items-center mb-5">
        <input 
          type="text" 
          value={inputValue} 
          onChange={handleInputChange} 
          placeholder="Enter chords separated by commas (e.g., Am, C, G)" 
          className="w-96 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleSubmit} 
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
        <button 
          onClick={fetchChords} 
          className="ml-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Generate
        </button>
      </div>

      <ReactFlow
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
      </ReactFlow>
    </>
  );
}

// Utility function to play chords
const playChords = async (selectedNodes, audioContextRef) => {
  if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
    console.error('AudioContext is closed. Cannot play sound.');
    return;
  }

  const audioContext = audioContextRef.current;
  const instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');

  const sortedNodes = [...selectedNodes].sort((a, b) => {
    if (a.position.y === b.position.y) {
      return a.position.x - b.position.x;
    }
    return a.position.y - b.position.y;
  });

  let currentTime = audioContext.currentTime;

  for (let node of sortedNodes) {
    const chordSequence = node.data.chordSequence;
    const notes = chordToNotes(chordSequence);

    if (notes.length > 0) {
      console.log(`Playing chord: ${chordSequence}, Notes: ${notes}`);
      instrument.schedule(currentTime, notes.map(note => ({ note, duration: 2 })));
      currentTime += 2;
    }
  }
};