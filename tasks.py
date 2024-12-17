import json
from crewai import Task
from textwrap import dedent

from pydantic import BaseModel, conlist
from typing import List

# Define pydantic chord model
class Chord(BaseModel):
    chord: List[str]
    suggestions: str

# Define pydantic model for B section 

class BSection(BaseModel):
    bsection: conlist(str, min_length=8, max_length=9)  # Updated for Pydantic v2
class CustomTasks:
    def generateChords(self, agent, sequence_1, sequence_2):
        return Task(
            description=dedent(
                f"""
                Use the RAG search tool to reference harmony principles and chord progressions 
                in the text file to propose a new progression that mixes the following:
                Sequence 1: {sequence_1}
                Sequence 2: {sequence_2}
                """
            ),
            expected_output="A valid chord progression based on harmony principles.",
            agent=agent,
        )
    
    # We provide an A section, but we want a B section which contrasts the previous chords (A section)

    def generateBSection(self, agent, sequence):
        return Task(
            description=dedent(
                f"""
                Use the RAG search tool to produce a "B" section based on the sequence provided ("A" Section).
                The B section should contrast the A section. This is very important!
                This is the A Section: {sequence}
                """
            ),
            expected_output="A valid chord progression that contrasts expertly with the provided A Section.",
            agent=agent,
        )

    def review_task(self, agent):
        return Task(
            description=dedent(
                """
                Use the RAG search tool to validate the generated chord progression.
                Provide concise tips on how to improve the progression based on harmony principles.
                """
            ),
            expected_output="Suggestions for improving the chord progression.",
            agent=agent,
            output_json=BSection,
        )
    def review_b_task(self, agent):
        return Task(
            description=dedent(
                """
                Use the RAG search tool to validate the generated chord progression.
                Provide concise tips on how to improve the progression based on harmony principles.
                """
            ),
            expected_output="8 chords in the expected json format",
            agent=agent,
            output_json=BSection,
        )