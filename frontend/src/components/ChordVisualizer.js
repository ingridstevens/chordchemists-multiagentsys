import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';
import * as Soundfont from 'soundfont-player';
import './ChordVisualizer.css';
import { chordMap } from '../constants/constants';
const { Renderer, Stave, StaveNote, Formatter, Annotation } = Vex.Flow;

/**
 * ChordVisualizer Component
 * Visualizes a chord sequence using VexFlow and adds audio playback with Soundfont.
 * @param {Array<string>} chordSequence - Array of chord names (e.g., ['Cmaj7', 'Dm7', 'G7']).
 */
const ChordVisualizer = ({ chordSequence }) => {
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous render
    containerRef.current.innerHTML = '';

    // Create VexFlow Renderer
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(110, 150);
    const context = renderer.getContext();

    // Create Stave
    const stave = new Stave(10, 30, 80);
    stave.setContext(context).draw();

    // Create notes for the chord sequence
    const notes = chordSequence.map((chord) => {
      const keys = (chordMap[chord] || []).map(note => `${note.replace(/(\d)/, '/$1')}`); // Convert to VexFlow format
      
      const staveNote = new StaveNote({
        keys,
        duration: 'h', // Half note
      });

      // Add chord name as text above the note
      const annotation = new Annotation(chord)
        .setFont('Arial', 24, '')
        .setVerticalJustification(Annotation.VerticalJustify.TOP);

      staveNote.addModifier(annotation, 0); // Attach annotation to the first notehead
      return staveNote;
    });

    // Format and draw notes
    Formatter.FormatAndDraw(context, stave, notes);
  }, [chordSequence]);

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
      <div ref={containerRef}></div>
      
    </div>
  );
};

export default ChordVisualizer;
