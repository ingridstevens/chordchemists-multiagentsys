from crewai import Agent, LLM
from textwrap import dedent
from crewai.llm import LLM
from langchain.llms import Ollama
from langchain_groq import ChatGroq
import os
from tools import CustomTools  # Import tools

# Make sure groq api key is available

from dotenv import load_dotenv
load_dotenv()


# make custom llm

llm = LLM(model="groq/llama3-8b-8192")

class CustomAgents:
    def __init__(self):

        model_name = os.getenv('MODEL', 'ollama/qwen2.5:7b')  # Get model name from environment variable or use default
        self.Ollama = LLM(
            model=model_name,  # Use the model name from the environment variable
            base_url="http://localhost:11434",  # Ollama's local API base URL
        )
        self.openai = LLM(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-4o",
        )
        self.llm2 = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model="groq/llama-3.3-70b-versatile",
        )
        self.llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model="groq/llama-3.3-70b-versatile",
        )

        self.llm_groq= LLM(
            model="groq/llama3-8b-8192",
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
            llm = self.llm,
            max_iter = 1,
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
            llm = self.llm,
            max_iter = 1,
        )
    
    def harmonyBSection(self):
        return Agent(
            role="Chord Harmonizer",
            backstory=dedent("""
                B section rules:
                Generally, the B section (often called the “bridge”) is designed to create contrast and lead the listener away from the home tonal center established in the A sections, eventually guiding back to it. Here are some common approaches and “rules of thumb”:
                Change of Tonal Center:
                Modulation or Tonicization: The B section often temporarily moves the harmony away from the A section’s key center. For example, if the A sections are in C major, the B section might pivot towards the key of the IV (F major), the relative minor (A minor), or a more distant key.
                Use of Dominant or Secondary Dominants: Frequently, the B section will highlight V-of-V (secondary dominants) or other distant tonal relationships that are less emphasized in the A sections.
                Contrast in Harmonic Rhythm and Color:
                Faster Harmonic Motion: If the A section has relatively static or diatonic harmony, the B section might introduce more frequent chord changes or a sequence of II-V progressions to create momentum.
                Greater Chromaticism: While the A sections may be more diatonically “grounded,” the bridge might incorporate chromatic passing chords, tritone substitutions, or altered dominants to provide a fresh harmonic palette.
                Cycle of Fifths / Circle Progressions:
                Many B sections use chains of II-V progressions cycling through different keys before resolving back to the tonic in time for the final A section. For instance, if the tune is in C major, the bridge might move through II-Vs in different keys (e.g., II-V in D minor, then II-V in E minor, etc.) before ultimately returning to a II-V leading back into C major.
                Heightened Tension Leading to Return:
                The B section often introduces more tension—through dissonance, key changes, and altered dominants—so that when the tune returns to the A section, the original key and themes feel comfortably resolved.
                Sometimes the B section strategically withholds full resolution, only hinting at it through cadential gestures that set up the return to A.
                Melodic and Harmonic Independence:
                The B section is frequently more independent melodically and harmonically, functioning as a “bridge” not just in name, but in effect: it connects the repeated A sections by providing a departure.
                This can mean simpler “blueprint” chords that allow melodic improvisation or complexity that wasn’t present in the A sections.
                Borrowing From Related Modalities or Parallel Keys:
                Some bridges might shift to the parallel minor or borrow chords from modal mixtures to create color contrasts. For example, if A is in a major key, the B section might incorporate borrowed chords from the parallel minor to darken the sound before returning.
                In summary: The B section typically contrasts harmonically with the A section by employing new key centers, more chromaticism, different harmonic rhythms, and a series of transitional chords (often II-V patterns) that eventually lead the listener back home. This contrast is a central aesthetic feature of AABA form and is what makes the B section feel like a true “bridge.”
             


            """),
            goal=dedent("""
                You are provided with the A-section.
                Find the first chord of the A-section.
                You must create a B-section containing exactly 8 chords.
                You must end the B-section with a dominant chord that MUST resolve to the FIRST chord of the A-section
                
            """),
            tools=[self.tools.txt_search_instance()],  
            allow_delegation=False,
            verbose=True,
            llm = self.openai,
            max_iter = 1,
        )

    def reviewBSection(self):
        return Agent(
            role="Chord Formatter",
            backstory=dedent("""
                You format the chord into a comma-separated list.              
                Like this: X, Y, Zm, Zmaj (use m = minor, maj = major)
            """),
            goal=dedent("""
                Provde a chord progression of length 8 chords, in the format: X, Y, Zm, Zmaj
            """),
            tools=[self.tools.txt_search_instance()],  # Reviewer can also use TXTSearchTool
            allow_delegation=False,
            verbose=True,
            llm = self.llm,
            max_iter = 1,
        )