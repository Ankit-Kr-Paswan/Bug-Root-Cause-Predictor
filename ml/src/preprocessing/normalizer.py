"""
Text normalization module for Python training pipeline.
Mirrors the preprocessing rules defined in docs/future-ml-integration.md
"""
import re

def normalize_error_text(text: str) -> str:
    """
    Standardize stack trace and error message text for tokenization and TF-IDF.
    """
    # Lowercase
    cleaned = text.lower()
    
    # Mask file paths
    cleaned = re.sub(r'(/[\w\-.]+)+/?', '<PATH>', cleaned)
    cleaned = re.sub(r'[a-zA-Z]:\\[\w\-.\\]+', '<PATH>', cleaned)
    
    # Mask line and column numbers
    cleaned = re.sub(r':\d+:\d+', ':<LOC>', cleaned)
    cleaned = re.sub(r'line \d+', 'line <NUM>', cleaned)
    
    # Mask hexadecimal memory addresses
    cleaned = re.sub(r'0x[a-f0-9]+', '<ADDR>', cleaned)
    
    return cleaned.strip()
