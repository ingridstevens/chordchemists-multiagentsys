from crewai import Agent
from textwrap import dedent
from crewai.llm import LLM
from langchain.llms import Ollama
import os
from tools import CustomTools  # Import tools

class CustomAgents:
    def __init__(self):

        model_name = os.getenv('MODEL', 'ollama/qwen2.5:7b')  # Get model name from environment variable or use default
        self.Ollama = LLM(
            model=model_name,  # Use the model name from the environment variable
            base_url="http://localhost:11434",  # Ollama's local API base URL
        )
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
                "proposed_progression": ["x", "x", "x", "x"]
            """),
            tools=[],  # Formatter does not need tools
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )
    
    def harmonyBSection(self):
        return Agent(
            role="Chord Harmonizer",
            backstory=dedent("""
                You are an expert in music harmony and chord progression.
                Use your knowledge and search tools to propose a chord sequence.
            """),
            goal=dedent("""
                The user will send you 8 chords that will be the A section of 
                a piece and you will come up with 8 new chords (B section) that
                are contrasting the 8 chords from the beginning. Explain carefully 
                why these chords provide a contrast to the A section. ONLY IF you receive 
                tips on how to enhance the progression provide a new chord progression following 
                precisely the tips. Always provide a chord progression
            """),
            tools=[self.tools.txt_search_instance()],  # Attach TXTSearchTool here
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )

    def reviewBSection(self):
        return Agent(
            role="Chord Reviewer",
            backstory=dedent("""
                You review chord progressions for harmonic quality.
                Use the search tool to validate the harmony.
            """),
            goal=dedent("""
                You are an expert in chord theory, you will review
                a chord sequence proposed and give tips on how to 
                improve the chord sequence so it is harmonically 
                interesting and still is contrasting to the A 
                section proposed at the beginning, ALWAYS provide 
                new tips, don't be indulgent. BE CONCISE AND GIVE 
                SHORT ANSWERS            """),
            tools=[self.tools.txt_search_instance()],  # Reviewer can also use TXTSearchTool
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )