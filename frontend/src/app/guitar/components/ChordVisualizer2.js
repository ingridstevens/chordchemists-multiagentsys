import React, { useEffect, useRef } from 'react';
import * as Soundfont from 'soundfont-player';
import './ChordVisualizer.css';
import { chordMap } from '../../../constants/constants';

/**
 * ChordVisualizer Component
 * Displays a sequence of chord names as plain text and adds audio playback with Soundfont.
 * @param {Array<string>} chordSequence - Array of chord names (e.g., ['Cmaj7', 'Dm7', 'G7']).
 */
const ChordVisualizer = ({ chordSequence }) => {
  const audioContextRef = useRef(null);

  // Function to play a chord
  const playChord = async (chord) => {
    const notes = chordMap[chord];
    if (!notes) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');

    instrument.schedule(audioContext.currentTime, notes.map(note => ({ note, duration: 2 }))); // Play the chord for a duration of 2 seconds
  };

  return (
    <div>
      {/* Render chord names as larger nodes */}
      <div>
        {chordSequence.map((chord, index) => (
          <div
            key={index}
            onClick={() => playChord(chord)}
            className="chord-name"
          >
            {chord} {/* Display the chord name */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChordVisualizer;
