import os
from crewai import Crew
from decouple import config
from agents import CustomAgents
from tasks import CustomTasks

from pydantic import BaseModel

class BSectionRequest(BaseModel):
    sequence: str

# Load environment variables
os.environ["OPENAI_API_KEY"] = config("OPENAI_API_KEY")
os.environ["GROQ_API_KEY"] = config("GROQ_API_KEY")


# Function to run the CrewAI workflow
def run_chord_progression_32(sequence: str):
    print("init chord prog")
    # Initialize agents and tasks
    agents = CustomAgents()
    tasks = CustomTasks()

    # Create agents
    print("create agents")
    harmonyBSection = agents.harmonyBSection()
    reviewBSection = agents.reviewBSection()

    # Define tasks
    print("def tasks")
    generateBSection = tasks.generateBSection(harmonyBSection, sequence)
    review_b_task = tasks.review_b_task(reviewBSection)

    # Initialize and execute the crew
    crew = Crew(
        agents=[harmonyBSection, reviewBSection],
        tasks=[generateBSection, review_b_task],
        verbose=True,
    )
    print("result:")
    result = crew.kickoff()

    # Return result as a string
    return result


