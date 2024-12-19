// components/ChordFetcher.js
"use client";

import { useState } from "react";

const ChordFetcher = () => {
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-b-section?sequence=");
      if (!response.ok) {
        throw new Error("Failed to fetch chords");
      }
      const data = await response.json();
      setChords(data.chords || []); // Assuming API returns a field 'chords' containing the array
    } catch (err) {
      setError("Error fetching chords: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchChords}>Get Chords</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {chords.length > 0 && (
        <div>
          <h3>Fetched Chords:</h3>
          <ul>
            {chords.map((chord, index) => (
              <li key={index}>{chord}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChordFetcher;
