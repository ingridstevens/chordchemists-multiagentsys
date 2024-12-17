import os
from crewai import Crew
from decouple import config
from textwrap import dedent
from agents import CustomAgents
from tasks import CustomTasks

# Load environment variables
os.environ["OPENAI_API_KEY"] = config("OPENAI_API_KEY")

class CustomCrew:
    def __init__(self, sequence_1, sequence_2):
        self.sequence_1 = sequence_1
        self.sequence_2 = sequence_2

    def run(self):
        # Initialize agents and tasks
        agents = CustomAgents()
        tasks = CustomTasks()

        harmonizer = agents.harmonizer_agent()
        reviewer = agents.reviewer_agent()
        formatter = agents.formatter_agent()

        # Define tasks
        harmonize_task = tasks.harmonize_task(harmonizer, self.sequence_1, self.sequence_2)
        review_task = tasks.review_task(reviewer)
        format_task = tasks.format_task(formatter)

        # Orchestrate the crew
        crew = Crew(
            agents=[harmonizer, reviewer, formatter],
            tasks=[harmonize_task, review_task, format_task],
            verbose=True,
        )

        result = crew.kickoff()
        return result


if __name__ == "__main__":
    print("## Welcome to Chord Progression Crew AI")
    print("---------------------------------------")
    sequence_1 = input(dedent("""Enter Chord Sequence 1: """))
    sequence_2 = input(dedent("""Enter Chord Sequence 2: """))

    # Run the custom crew
    custom_crew = CustomCrew(sequence_1, sequence_2)
    result = custom_crew.run()

    print("\n\n########################")
    print("## Final Chord Progression:")
    print("########################\n")
    print(result)