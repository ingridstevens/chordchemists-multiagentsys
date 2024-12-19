import React from 'react';
import { exportChordsToMidi } from '../utils/midiExporter';

const ExportButton = (chordSequence) => {
  
  const handleExport = () => {
    exportChordsToMidi(chordSequence);
  };

  return (
    <button onClick={handleExport} style={{ padding: '10px', fontSize: '16px' }}>
      Export Chords to MIDI
    </button>
  );
};

export default ExportButton;
