import React from 'react'

export default function SequenceDisplay({ sequence }: { sequence: string[] }) {
  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Chord Sequence:</h3>
      <p className="text-xl">{sequence.join(' → ')}</p>
    </div>
  )
}

