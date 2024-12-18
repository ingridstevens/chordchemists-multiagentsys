import os

def combine_txt_files(input_directory, output_file):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(input_directory):
            for file in files:
                if file.endswith('.txt'):
                    file_path = os.path.join(root, file)
                    print(f"Processing: {file_path}")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read() + "\n")
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")

# Set input directory and output file path
input_directory = "/Users/ingrid/Developer/test-ufp/crew-ai/data/SongDB"
output_file = "/Users/ingrid/Developer/test-ufp/crew-ai/data/SongDBAll.txt"

# Combine all .txt files recursively
combine_txt_files(input_directory, output_file)
print(f"All text files combined into: {output_file}")