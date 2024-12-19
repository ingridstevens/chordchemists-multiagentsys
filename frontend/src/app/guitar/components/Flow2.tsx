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
import { initialNodes, nodeTypes, type CustomNodeType } from "./nodes2";
import { initialEdges, edgeTypes, type CustomEdgeType } from "./edges2";

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
  const [fetchedChords, setFetchedChords] = useState<string[]>([]); // To store fetched chords
  const nodeWidth = 150; // Width of each node
  const nodeHeight = 100; // Height of each node
  const maxColumns = 4; // Maximum number of nodes per row (can be adjusted based on your layout)

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

  // Fetch chords from the API
  const fetchChords = async () => {
    const response = await fetch(`http://127.0.0.1:8000/generate-b-section?sequence=`);
    const data = await response.json();
    const fetchedChords = data.result.split(',').map((chord: string) => chord.trim());
    setFetchedChords(fetchedChords);
    console.log('Fetched Chords:', fetchedChords);

    // Automatically submit fetched chords
    handleFetchedChords(fetchedChords);
  };

  // Handle fetched chords and update the nodes
  const handleFetchedChords = (fetchedChords: string[]) => {
    const highestNodeId = Math.max(...nodes.map(node => parseInt(node.id, 10)), 0);
    const newNodes = fetchedChords.map((chord, index) => {
      const row = Math.floor((nodes.length + index) / maxColumns); // Determine the row (based on columns)
      const column = (nodes.length + index) % maxColumns; // Determine the column in the row

      return {
        id: `${highestNodeId + index + 1}`,
        type: 'textUpdater', // or any other custom node type
        position: {
          x: column * nodeWidth, // Spaced horizontally
          y: row * nodeHeight, // Spaced vertically
        },
        data: { chordSequence: [chord] },
        style: { backgroundColor: "#ffffff", color: "white", borderColor: "white" }
      };
    });

    // Update the nodes state with fetched chords
    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
  };

  // Handle text input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Handle submit button click to create nodes from input
  const handleSubmit = () => {
    const chordList = inputValue.split(',').map(chord => chord.trim()).filter(chord => chord.length > 0);
    console.log('Chord List:', chordList);

    // Validate chords
    chordList.forEach(chord => {
      if (!chordMap[chord]) {
        console.error(`Invalid chord input: ${chord}. Please check the chord symbol.`);
      }
    });

    // Filter out any invalid chords
    const validChords = chordList.filter(chord => chordMap[chord]);

    // Calculate the next available position for the new nodes
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
      <div style={styles.inputContainer}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={handleInputChange} 
          placeholder="Enter chords separated by commas (e.g., Cmaj7, Dm7, G7)" 
          style={styles.inputBox} 
        />
        <button 
          onClick={handleSubmit} 
          style={styles.submitButton}
        >
          Submit
        </button>
        <button 
          onClick={fetchChords} 
          style={styles.submitButton}
        >
          Fetch Chords
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

const styles = {
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  inputBox: {
    width: '300px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px',
    transition: 'background-color 0.3s ease',
  }
};
