# **Chord Progression Generator - CrewAI Project**

This project uses **CrewAI** to generate, review, and format chord progressions. The workflow involves multiple AI agents collaborating to create harmonic and musically interesting progressions. A **TXT RAG Search Tool** is integrated to provide relevant data from a chord library text file.

---

## **Project Structure**

### 1. `agents.py`
Defines custom agents that perform specific roles in the workflow:

- **Harmonizer Agent**: Proposes a chord progression by mixing two input sequences.
- **Reviewer Agent**: Reviews the progression and provides tips for improvement.
- **Formatter Agent**: Ensures the final progression is formatted correctly as JSON.

Each agent includes:
- **Role**: The agent's role.
- **Backstory**: Agent context and expertise.
- **Goal**: The objective for the agent.
- **Tools**: Optional tools for task execution (e.g., TXT RAG Search Tool).

[More Details about Agents](https://docs.crewai.com/concepts/agents)

---

### 2. `tasks.py`
Defines tasks assigned to agents. Each task specifies:
1. **Description**: A clear explanation of what needs to be done.
2. **Agent**: The agent assigned to perform the task.
3. **Expected Output**: The result expected from the agent.

Tasks:
- **Harmonize Task**: Mix two chord sequences into a new progression.
- **Review Task**: Validate and refine the chord progression.
- **Format Task**: Ensure the output matches the required JSON format.

[More Details about Tasks](https://docs.crewai.com/concepts/tasks)

---

### 3. `tools.py`
Contains the **TXT RAG Search Tool**, which allows agents to search for chord progression knowledge from a local text file.

- **TXTSearchTool**: A custom tool that:
  - Reads content from `data/chords_data.txt`.
  - Performs semantic searches to find relevant information.
  
Example usage:
```python
from tools import TXTSearchTool

tool = TXTSearchTool(txt_file="data/chords_data.txt")
results = tool.search("Em F Fm")  # Searches for relevant chord data


### 4. `main.py`
The main orchestrator file where:
1. Agents are instantiated and tasks are assigned.
2. A **Crew** is created with a list of agents and tasks.
3. The workflow is executed sequentially.

Key parameters:
- **Agents**: List of agents.
- **Tasks**: List of tasks.
- **Verbose**: Prints task execution details.
- **Debug**: Enables detailed logs.

**How it Works**:
1. Input two chord sequences.
2. Agents collaborate:
   - Harmonizer → Generate progression.
   - Reviewer → Validate and improve.
   - Formatter → Ensure proper JSON format.
3. Output:
   
    "proposed_progression": ["Cmaj7", "Dm7", "G7", "Cmaj7"]
    
    ## **Setup Instructions**

### Step 1: Clone the Repository

    git clone https://github.com/ingridstevens/chordchemists-multiagentsys
    cd your-repo-name

## Step 2: Create a Virtual Environment

    python -m venv env_crewai
    source env_crewai/bin/activate

## Step 3: Install the Required Libraries

    pip install -r requirements.txt 


## Run the Project

    python main.py

## Example inputs 

    Enter Chord Sequence 1: Em F Fm
    Enter Chord Sequence 2: G7 Am C D7