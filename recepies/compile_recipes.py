#!/usr/bin/env python3
"""
Recipe Compilation Script with Grammar Verification

This script verifies that all constructors and methods used in .food recipe files
are properly defined in the grammar/tokens.json file before compiling them with
line numbers. It will not compile recipes if there are missing tokens in the grammar.

Features:
- Extracts all constructors and methods from .food files
- Verifies they exist in grammar/tokens.json
- Only compiles if grammar is complete
- Adds line numbers and tabs to compiled recipes
"""

import os
import json
import re
import glob
from pathlib import Path
from typing import Set, Dict, List, Tuple

def extract_constructors_from_files(source_dir: Path) -> Set[str]:
    """
    Extract all constructor names from .food files.
    
    Args:
        source_dir: Directory containing .food files
        
    Returns:
        Set of constructor names found in files
    """
    constructors = set()
    food_files = list(source_dir.glob("*.food"))
    
    for file_path in food_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find all "new ConstructorName(" patterns
            matches = re.findall(r'new ([A-Z][a-zA-Z]*)\(', content)
            constructors.update(matches)
    
    return constructors

def extract_methods_from_files(source_dir: Path) -> Set[str]:
    """
    Extract all method names from .food files.
    
    Args:
        source_dir: Directory containing .food files
        
    Returns:
        Set of method names found in files
    """
    methods = set()
    food_files = list(source_dir.glob("*.food"))
    
    for file_path in food_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find all ".methodName(" patterns
            matches = re.findall(r'\.([a-zA-Z][a-zA-Z]*)\(', content)
            methods.update(matches)
    
    return methods

def load_grammar_tokens(grammar_file: Path) -> Dict:
    """
    Load and parse the grammar tokens file.
    
    Args:
        grammar_file: Path to tokens.json file
        
    Returns:
        Dictionary containing grammar tokens
    """
    with open(grammar_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_grammar_constructors(tokens: Dict) -> Set[str]:
    """
    Extract all constructors from grammar tokens.
    
    Args:
        tokens: Grammar tokens dictionary
        
    Returns:
        Set of all constructor names in grammar
    """
    constructors = set()
    if 'types' in tokens:
        constructors.update(tokens['types'].get('ingredients', []))
        constructors.update(tokens['types'].get('utensils', []))
    return constructors

def get_grammar_methods(tokens: Dict) -> Set[str]:
    """
    Extract all methods from grammar tokens.
    
    Args:
        tokens: Grammar tokens dictionary
        
    Returns:
        Set of all method names in grammar
    """
    methods = set()
    
    # Add builtin functions
    methods.update(tokens.get('builtins', []))
    
    # Add all action methods
    if 'actions' in tokens:
        for category, method_list in tokens['actions'].items():
            methods.update(method_list)
    
    return methods

def verify_grammar_completeness(source_dir: Path, grammar_file: Path) -> Tuple[bool, List[str], List[str]]:
    """
    Verify that all constructors and methods used in recipes are in grammar.
    
    Args:
        source_dir: Directory containing .food files
        grammar_file: Path to tokens.json file
        
    Returns:
        Tuple of (is_complete, missing_constructors, missing_methods)
    """
    # Extract from files
    file_constructors = extract_constructors_from_files(source_dir)
    file_methods = extract_methods_from_files(source_dir)
    
    # Load grammar
    tokens = load_grammar_tokens(grammar_file)
    grammar_constructors = get_grammar_constructors(tokens)
    grammar_methods = get_grammar_methods(tokens)
    
    # Find missing items
    missing_constructors = sorted(file_constructors - grammar_constructors)
    missing_methods = sorted(file_methods - grammar_methods)
    
    is_complete = len(missing_constructors) == 0 and len(missing_methods) == 0
    
    return is_complete, missing_constructors, missing_methods

def add_line_numbers_to_file(input_file: Path, output_file: Path):
    """
    Add line numbers and tab character to each line of a file.
    
    Args:
        input_file: Path to the input file
        output_file: Path to the output file
    """
    with open(input_file, 'r', encoding='utf-8') as infile:
        lines = infile.readlines()
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for line_num, line in enumerate(lines, 1):
            # Remove existing newline, add line number and tab, then add newline back
            line_content = line.rstrip('\n')
            numbered_line = f"{line_num:>5}\t{line_content}\n"
            outfile.write(numbered_line)

def compile_recipes(source_dir: Path, output_dir: Path) -> int:
    """
    Compile all .food files by adding line numbers.
    
    Args:
        source_dir: Directory containing source .food files
        output_dir: Directory for compiled output files
        
    Returns:
        Number of files compiled
    """
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get all .food files from source directory
    food_files = list(source_dir.glob("*.food"))
    
    if not food_files:
        print(f"No .food files found in {source_dir}")
        return 0
    
    print(f"Compiling {len(food_files)} recipe files...")
    
    # Process each file
    for input_file in food_files:
        output_file = output_dir / input_file.name
        add_line_numbers_to_file(input_file, output_file)
        print(f"  Compiled: {input_file.name}")
    
    return len(food_files)

def main():
    """Main function to verify grammar and compile recipes."""
    # Define paths
    source_dir = Path("converted")
    output_dir = Path("compiled")
    grammar_file = Path("../grammar/tokens.json")
    
    print("=== Recipe Compilation with Grammar Verification ===\n")
    
    # Check if required directories and files exist
    if not source_dir.exists():
        print(f"❌ Error: Source directory '{source_dir}' does not exist")
        return 1
    
    if not grammar_file.exists():
        print(f"❌ Error: Grammar file '{grammar_file}' does not exist")
        return 1
    
    # Verify grammar completeness
    print("🔍 Verifying grammar completeness...")
    is_complete, missing_constructors, missing_methods = verify_grammar_completeness(source_dir, grammar_file)
    
    if not is_complete:
        print("❌ Grammar verification FAILED!")
        print("\nMissing constructors in grammar:")
        for constructor in missing_constructors:
            print(f"  - {constructor}")
        
        print("\nMissing methods in grammar:")
        for method in missing_methods:
            print(f"  - {method}")
        
        print(f"\n⚠️  Please add the missing tokens to '{grammar_file}' before compiling.")
        print("   Compilation aborted to prevent syntax highlighting issues.")
        return 1
    
    print("✅ Grammar verification PASSED!")
    print("   All constructors and methods are properly defined in grammar.\n")
    
    # Proceed with compilation
    print("🔨 Starting recipe compilation...")
    compiled_count = compile_recipes(source_dir, output_dir)
    
    if compiled_count > 0:
        print(f"\n✅ Successfully compiled {compiled_count} recipe files!")
        print(f"   Output saved to: {output_dir}")
        
        # Display summary statistics
        tokens = load_grammar_tokens(grammar_file)
        grammar_constructors = get_grammar_constructors(tokens)
        grammar_methods = get_grammar_methods(tokens)
        
        print(f"\n📊 Grammar Statistics:")
        print(f"   - {len(grammar_constructors)} constructors defined")
        print(f"   - {len(grammar_methods)} methods/functions defined")
        print(f"   - {compiled_count} recipes compiled with line numbers")
    else:
        print("⚠️  No files were compiled.")
    
    return 0

if __name__ == "__main__":
    exit(main())
