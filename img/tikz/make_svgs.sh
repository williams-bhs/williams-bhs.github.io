#!/bin/bash

# Requires that texlive and pdf2svg 

# Exit on error
set -e

# Loop through all .tex files in the current directory
for texfile in *.tex; do
    # Get the base filename (without extension)
    base="${texfile%.tex}"

    echo "Processing $texfile..."

    # Compile to PDF
    pdflatex -interaction=nonstopmode "$texfile"

    # Convert PDF to SVG
    pdf2svg "${base}.pdf" "../${base}.svg"
        
    # Clean up auxiliary files
    #rm -f "${base}.aux" "${base}.log" "${base}.pdf"

    echo "Created ${base}.svg"
done

echo "Done!"

