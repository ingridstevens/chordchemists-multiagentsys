from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import logging
from typing import List
from generator import run_chord_progression_32

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)



# Endpoint 1: Upload audio and generate 3 variations
@app.post("/generate")
async def upload_audio(
    chord_sequence: str = Form(...),
):
    result = run_chord_progression_32(chord_sequence)
    # chord_sequence = result["json_dict"]["bsection"]
    result = result.to_dict()
    return {"chord_sequence:": result["bsection"]}


if __name__ == "main":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
