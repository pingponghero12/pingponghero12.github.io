#!/bin/bash

# Script to create small versions of all images in a directory
# Usage: ./resize_images.sh [directory] [width]
# If no directory is provided, uses current directory
# If no width is provided, defaults to 300px

# Set directory and width
DIR=${1:-.}
WIDTH=${2:-300}

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    echo "On Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "On macOS with Homebrew: brew install imagemagick"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "${DIR}/small"

# Find all image files and resize them
find "$DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) | while read -r img; do
    filename=$(basename "$img")
    base="${filename%.*}"
    ext="${filename##*.}"
    
    echo "Resizing: $filename"
    magick convert "$img" -resize "${WIDTH}x" "${DIR}/small/${base}-small.${ext}"
    echo "Created: small/${base}-small.${ext}"
done

echo "Done! Resized images are in the 'small' subdirectory."
