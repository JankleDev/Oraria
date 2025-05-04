#!/bin/bash

# Clear existing scripts (optional - uncomment if you want fresh copies)
# rm -rf BP/scripts/*

# Create target directory
rm -r BP/scripts
mkdir -p BP/scripts

# Process each file
find src -type f | while read -r file; do
    # Calculate relative path
    rel_path="${file#src/}"
    
    # Create target directory if needed
    target_dir="BP/scripts/$(dirname "$rel_path")"
    
    mkdir -p "$target_dir"
    
    # Copy the file
    cp "$file" "BP/scripts/$rel_path"
done

# Function to display filesystem with .js files
display_js_filesystem() {
    local dir="${1:-.}"  # Default to current directory if none provided
    local indent="$2"

    # Loop through each item in the directory
    for item in "$dir"/*; do
        # If it's a directory, recurse into it
        if [ -d "$item" ]; then
            echo "${indent} $(basename "$item")"
            display_js_filesystem "$item" "$indent  "
        # If it's a .js file, display it
        elif [[ "$item" == *.js ]]; then
            echo "${indent} $(basename "$item")"
        fi
    done
}

echo "✅ Copied all files from src/ to BP/scripts/"
echo "File Tree:"

display_js_filesystem "./BP/scripts" ""