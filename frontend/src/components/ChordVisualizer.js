import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';
import * as Soundfont from 'soundfont-player';
import './ChordVisualizer.css';
import { chordMap } from '../constants/constants';

const ChordVisualizer = ({ chordSequence }) => {
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous render
    containerRef.current.innerHTML = '';

    const VF = Vex.Flow;
    
    // Increase the size of the renderer
    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(200, 200); // Increased width and height

    const context = renderer.getContext();

    // Adjust stave position and width
    const stave = new VF.Stave(10, 40, 180); // Increased width and adjusted y position
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Create notes for the chord sequence
    const notes = chordSequence.map((chord) => {
      const keys = (chordMap[chord] || []).map(note => {
        return note.toLowerCase().replace(/(\d)/, '/$1');
      });

      return new VF.StaveNote({ 
        keys, 
        duration: "w",
      });
    });

    // Create a voice and add the notes
    const voice = new VF.Voice().addTickables(notes);

    // Apply accidentals
    VF.Accidental.applyAccidentals([voice], 'C');

    // Add chord names as annotations
    notes.forEach((note, i) => {
      const annotation = new VF.Annotation(chordSequence[i])
        .setFont('Arial', 12, '')
        .setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
      note.addModifier(annotation, 0);
    });

    // Format and draw with more space
    const formatter = new VF.Formatter()
      .joinVoices([voice])
      .format([voice], 160); // Increased formatting width

    voice.draw(context, stave);
  }, [chordSequence]);

  const playChord = async (chord) => {
    const notes = chordMap[chord];
    if (!notes) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');

    instrument.schedule(audioContext.currentTime, notes.map(note => ({ note, duration: 2 })));
  };

  return (
    <div>
      {chordSequence.map((chord, index) => (
          <div
            key={index}
            onClick={() => playChord(chord)}
            className="chord-name"
            ref={containerRef}
          >

          </div>
        ))}
    
      
    </div>
  );
};

export default ChordVisualizer;