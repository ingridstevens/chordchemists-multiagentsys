from crewai import Task
from textwrap import dedent

class CustomTasks:
    def harmonize_task(self, agent, sequence_1, sequence_2):
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
        )

    def format_task(self, agent):
        return Task(
            description=dedent(
                """
                Format the final chord progression into the exact required JSON format:
                "proposed_progression": ["Cmaj7", "Dm7", "G7", "Cmaj7"]
                """
            ),
            expected_output='"proposed_progression": ["Cmaj7", "Dm7", "G7", "Cmaj7"]',
            agent=agent,
        )