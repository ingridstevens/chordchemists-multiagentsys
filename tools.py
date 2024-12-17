from crewai_tools import TXTSearchTool

class CustomTools:
    def __init__(self):
        # Initialize TXTSearchTool to work with a specific text file
        self.txt_search_tool = TXTSearchTool(txt="data/chords_data.txt")

    def txt_search_instance(self):
        """Return TXTSearchTool instance."""
        return self.txt_search_tool