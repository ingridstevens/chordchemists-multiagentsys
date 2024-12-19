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
      
      // Schedule each note with a delay between them (e.g., 0.5 seconds apart)
      notes.forEach((note, index) => {
        instrument.schedule(currentTime + index * 0.5, [{ note, duration: 2 }]); // 2 seconds duration for each note
      });

      // After scheduling the current chord, advance time by 2 seconds for the next chord
      currentTime += 2;
    }
  }
};
