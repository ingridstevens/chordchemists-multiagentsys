from crewai import Agent
from textwrap import dedent
from langchain.llms import Ollama
from tools import CustomTools  # Import tools

class CustomAgents:
    def __init__(self):
        self.Ollama = Ollama(model="qwen2.5:7b")
        self.tools = CustomTools()  # Initialize custom tools

    def harmonizer_agent(self):
        return Agent(
            role="Chord Harmonizer",
            backstory=dedent("""
                You are an expert in music harmony and chord progression.
                Use your knowledge and search tools to propose a chord sequence.
            """),
            goal=dedent("""
                Generate a chord progression that mixes two provided progressions.
                Use the text-based RAG search tool for reference.
            """),
            tools=[self.tools.txt_search_instance()],  # Attach TXTSearchTool here
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )

    def reviewer_agent(self):
        return Agent(
            role="Chord Reviewer",
            backstory=dedent("""
                You review chord progressions for harmonic quality.
                Use the search tool to validate the harmony.
            """),
            goal=dedent("""
                Provide improvement suggestions to ensure the chord progression is interesting and harmonically correct.
            """),
            tools=[self.tools.txt_search_instance()],  # Reviewer can also use TXTSearchTool
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )

    def formatter_agent(self):
        return Agent(
            role="Formatter",
            backstory=dedent("""
                You format the chord progression into the required JSON format.
            """),
            goal=dedent("""
                Ensure the final chord progression is formatted correctly as:
                "proposed_progression": ["Cmaj7", "Dm7", "G7", "Cmaj7"]
            """),
            tools=[],  # Formatter does not need tools
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )