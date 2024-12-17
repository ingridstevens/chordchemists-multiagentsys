from crewai import Task
from textwrap import dedent


class CustomTasks:
    def harmonize_task(self, agent, sequence_1, sequence_2):
        return Task(
            description=dedent(
                f"""
                Generate a new chord progression that mixes these two progressions:
                Sequence 1: {sequence_1}
                Sequence 2: {sequence_2}

                Always propose a valid chord progression.
                """
            ),
            expected_output="A valid chord progression.",
            agent=agent,
        )

    def review_task(self, agent):
        return Task(
            description=dedent(
                """
                Review the chord progression proposed by the Harmonizer.
                Provide short, concise tips on how to improve the progression while keeping it interesting and harmonic.
                """
            ),
            expected_output="Concise improvement suggestions for the progression.",
            agent=agent,
        )

    def format_task(self, agent):
        return Task(
            description=dedent(
                """
                Format the final chord progression into the exact required JSON format:
                "proposed_progression": ["Cmaj7", "Dm7", "G7", "Cmaj7"]

                Do not add any explanation or extra text. Only output the formatted result.
                """
            ),
            expected_output='"proposed_progression": ["Cmaj7", "Dm7", "G7", "Cmaj7"]',
            agent=agent,
        )