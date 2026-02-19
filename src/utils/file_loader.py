def load_file(path: str) -> str:
    if path.endswith(".txt"):
        return load_txt_file(path)

def load_txt_file(path: str) -> str:
    with open(path, 'r') as file:
        content = file.read()
    
    return content