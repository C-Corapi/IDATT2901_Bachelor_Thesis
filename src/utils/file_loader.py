def load_file(path: str) -> str:
    """Loads a supported file type and return its contents as a string.
       Currently, only plain text files (".txt") are supported.

       Args:
           path: Path to the file to load.
       Returns:
           The file contents as a string.
       Raises:
           ValueError: If the file extension is not supported.
       """
    if path.endswith(".txt"):
        return load_txt_file(path)
    else:
        raise ValueError(f"Unsupported file type: {path}")

def load_txt_file(path: str) -> str:
    """Loads a text file and return its contents.

       Args:
           path: Path to a ".txt" file.
       Returns:
           The complete file contents as a string.
       Raises:
           OSError: If the file cannot be opened or read (e.g., missing permissions).
       """
    with open(path, 'r') as file:
        content = file.read()
    return content