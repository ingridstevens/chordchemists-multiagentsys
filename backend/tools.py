from crewai_tools import TXTSearchTool
from crewai_tools import JSONSearchTool

class CustomTools:
    def __init__(self):
        # Initialize TXTSearchTool to work with a specific text file
        self.txt_search_tool = TXTSearchTool(txt="data/JazzStandards.txt")
        self.json_search_tool = JSONSearchTool(
            json_path="data/SongDB/JazzStandards.json", 
            search_query="find the chord")

        
    def txt_search_instance(self):
        """Return TXTSearchTool instance."""
        return self.txt_search_tool

    def json_search_instance(self):
        """Return JSONSearchTool instance."""
        return self.json_search_tool
    

