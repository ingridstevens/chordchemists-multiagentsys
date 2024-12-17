from crewai import Agent
from textwrap import dedent
from langchain.llms import Ollama


class CustomAgents:
    def __init__(self):
        self.Ollama = Ollama(model="qwen2.5:7b")

    def harmonizer_agent(self):
        return Agent(
            role="Chord Harmonizer",
            backstory=dedent("""You are an expert in music harmony and chord progression."""),
            goal=dedent("""Generate a chord progression that mixes two provided progressions."""),
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )

    def reviewer_agent(self):
        return Agent(
            role="Chord Reviewer",
            backstory=dedent("""You are an expert music theorist who reviews chord progressions for harmony and interest."""),
            goal=dedent("""Review a chord progression and provide concise improvement suggestions."""),
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )

    def formatter_agent(self):
        return Agent(
            role="Chord Formatter",
            backstory=dedent("""You are a formatting expert that ensures outputs are in the required JSON format."""),
            goal=dedent("""Format the final chord progression into the exact format: 
            'proposed_progression': ['Cmaj7','Dm7','G7','Cmaj7']"""),
            allow_delegation=False,
            verbose=True,
            llm=self.Ollama,
        )