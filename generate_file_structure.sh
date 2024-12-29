#!/bin/bash

# Function to recursively list files and directories
generate_json() {
  local dir_path="$1"
  local indent="$2"
  local json=""

  json+="${indent}{\n"
  json+="${indent}  \"path\": \"${dir_path}\",\n"
  json+="${indent}  \"files\": [\n"

  local first=true
  for file in "$dir_path"/*; do
    if [ -f "$file" ]; then
      if [ "$first" = true ]; then
        first=false
      else
        json+=",\n"
      fi
      json+="${indent}    \"$(basename "$file")\""
    fi
  done

  json+="\n${indent}  ],\n"
  json+="${indent}  \"folders\": [\n"

  first=true
  for folder in "$dir_path"/*; do
    if [ -d "$folder" ]; then
      if [ "$first" = true ]; then
        first=false
      else
        json+=",\n"
      fi
      json+=$(generate_json "$folder" "    $indent")
    fi
  done

  json+="\n${indent}  ]\n"
  json+="${indent}}"

  echo -e "$json"
}

# Main script
public_folder="public"
output_file="public/structure.json"

echo "[" > "$output_file"
generate_json "$public_folder" "" >> "$output_file"
echo "]" >> "$output_file"