import os
from crewai import Crew
from decouple import config
from agents import CustomAgents
from tasks import CustomTasks
import gradio as gr  # Import Gradio

# Load environment variables
os.environ["OPENAI_API_KEY"] = config("OPENAI_API_KEY")

# Function to run the CrewAI workflow
def run_chord_progression(sequence_1, sequence_2):
    # Initialize agents and tasks
    agents = CustomAgents()
    tasks = CustomTasks()

    # Create agents
    harmonizer = agents.harmonizer_agent()
    reviewer = agents.reviewer_agent()
    formatter = agents.formatter_agent()

    # Define tasks
    harmonize_task = tasks.harmonize_task(harmonizer, sequence_1, sequence_2)
    review_task = tasks.review_task(reviewer)
    format_task = tasks.format_task(formatter)

    # Initialize and execute the crew
    crew = Crew(
        agents=[harmonizer, reviewer, formatter],
        tasks=[harmonize_task, review_task, format_task],
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
        return f"Generated Progression:\n\n{result}"
    except Exception as e:
        return f"Error: {str(e)}"

# Gradio Interface
if __name__ == "__main__":
    demo = gr.Interface(
        fn=gradio_chord_progression,
        inputs=[
            gr.Textbox(label="Chord Sequence 1", placeholder="Enter first chord sequence, e.g., Em F Fm"),
            gr.Textbox(label="Chord Sequence 2", placeholder="Enter second chord sequence, e.g., G7 Am C D7")
        ],
        outputs=gr.Textbox(label="Generated Chord Progression"),
        title="Chord Progression Generator",
        description="Input two chord sequences and let AI harmonize, review, and format the final progression.",
    )

    demo.launch()