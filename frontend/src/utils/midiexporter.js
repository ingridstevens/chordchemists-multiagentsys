import { Midi } from '@tonejs/midi';

/**
 * Converts a chord name to MIDI notes.
 * @param {string} chordName - Name of the chord (e.g., "Cmaj7").
 * @returns {Array<number>} MIDI note numbers.
 */
const chordToMidi = (chordName) => {
  const chordMap = {
    Cmaj7: [60, 64, 67, 71], // C E G B
    Dm7: [62, 65, 69, 72],  // D F A C
    G7: [67, 70, 74, 77],   // G B D F
    // Add more chord mappings as needed
  };

  return chordMap[chordName] || [];
};

/**
 * Exports a chord sequence to a MIDI file.
 * @param {Array<string>} chordSequence - Array of chord names.
 */
export const exportChordsToMidi = (chordSequence) => {
  const midi = new Midi();

  const track = midi.addTrack();
  let time = 0;

  chordSequence.forEach((chord) => {
    const notes = chordToMidi(chord);
    notes.forEach((note) => {
      track.addNote({
        midi: note,
        time,
        duration: 1, // 1 second duration
      });
    });
    time += 1; // Move to the next second
  });

  const midiData = midi.toArray();
  const blob = new Blob([midiData], { type: 'audio/midi' });

  // Create a link to download the file
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'chords.mid';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
