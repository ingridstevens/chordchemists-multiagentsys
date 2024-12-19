import os
from crewai import Crew
from decouple import config
from agents import CustomAgents
from tasks import CustomTasks
import gradio as gr  # Import Gradio


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class BSectionRequest(BaseModel):
    sequence: str

# Load environment variables
os.environ["OPENAI_API_KEY"] = config("OPENAI_API_KEY")
os.environ["GROQ_API_KEY"] = config("GROQ_API_KEY")


# Function to run the CrewAI workflow
def run_chord_progression(sequence_1, sequence_2):
    # Initialize agents and tasks
    agents = CustomAgents()
    tasks = CustomTasks()

    # Create agents
    harmonizer = agents.harmonizer_agent()
    reviewer = agents.reviewer_agent()

    # Define tasks
    generateChords = tasks.generateChords(harmonizer, sequence_1, sequence_2)
    review_task = tasks.review_task(reviewer)

    # Initialize and execute the crew
    crew = Crew(
        agents=[harmonizer],
        tasks=[generateChords],
        verbose=True,
    )
    result = crew.kickoff()

    # Return result as a string
    return result



# Function to run the CrewAI workflow
def run_chord_progression_32(sequence):
    # Initialize agents and tasks
    agents = CustomAgents()
    tasks = CustomTasks()

    # Create agents
    harmonizer = agents.harmonizer_agent()
    reviewer = agents.reviewer_agent()
    harmonyBSection = agents.harmonyBSection()
    reviewBSection = agents.reviewBSection()

    # Define tasks
    generateBSection = tasks.generateBSection(harmonyBSection, sequence)
    review_b_task = tasks.review_b_task(reviewer)

    # Initialize and execute the crew
    crew = Crew(
        agents=[harmonyBSection, reviewBSection],
        tasks=[generateBSection, review_b_task],
        verbose=True,
    )
    result = crew.kickoff()

    # Return result as a string
    return result

# Function for Gradio UI
def gradio_chord_progression(seq1, seq2):
    """
    Gradio wrapper for the CrewAI workflow.
    Inputs:
      - seq1: Chord sequence 1
      - seq2: Chord sequence 2
    """
    try:
        result = run_chord_progression(seq1, seq2)
        return f"{result}"
    except Exception as e:
        return f"Error: {str(e)}"


# Function for Gradio UI
def gradio_chord_progression_32(seq1):
    """
    Gradio wrapper for the CrewAI workflow.
    Inputs:
      - seq1: Chord sequence 1
      - seq2: Chord sequence 2
    """
    try:
        result = run_chord_progression_32(seq1)
        return f"{result}"
    except Exception as e:
        return f"Error: {str(e)}"

# Gradio Interfaces for Tabs
chordMixer = gr.Interface(
    fn=gradio_chord_progression,
    inputs=[
        gr.Textbox(label="Chord Sequence 1", placeholder="Enter first chord sequence, e.g., Em F Fm"),
        gr.Textbox(label="Chord Sequence 2", placeholder="Enter second chord sequence, e.g., G7 Am C D7")
    ],
    outputs=gr.Textbox(label="Generated Chords"),
    title="Chords Generator",
    description="Input two chord sequences and let AI harmonize, review, and format the final progression.",
    examples=[
        ["C G Am F", "D7 G Em C"],
        ["Em F Fm", "G7 Am C D7"],
        ["Dm7 G7 Cmaj7", "Am7 Dm7 G7"],
    ],
)

chord32gen = gr.Interface(
    fn=gradio_chord_progression_32,
    inputs=[
        gr.Textbox(label="Chord Sequence", placeholder="Enter a chord sequence composed of 8 chords, e.g., G7 Am C D7 G7 Am C D7")
    ],
    outputs=gr.Textbox(label="Generated Chord Progression"),
    title="B Section Generator",
    description="Input a length 8 chord sequence as A and let AI generate the B Section.",
    examples=[
        ["C G Am F D7 G Em C"],
        ["Em F Fm G7 Am C D7 Em"],
        ["Am7-D7-Gmaj7-Cma7-F#m7b5-B7-Em7-Em7"]
    ],
)

@app.get("/generate-b-section")
def generate_b_section(sequence: str):
    try:
        result = run_chord_progression_32(sequence)

        # Access the B-section from the result directly
        bsection = result.bsection if hasattr(result, 'bsection') else "No B-section found"

        return {result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating B section: {str(e)}")


# Combine Tabs into a Tabbed Interface
# if __name__ == "__main__":
#     demo = gr.TabbedInterface([chord32gen, chordMixer], ["B Section Generator", "Chords Generator"])
#     demo.launch()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)