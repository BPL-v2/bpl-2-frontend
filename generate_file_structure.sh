#!/bin/sh

# Function to recursively list files and directories
generate_json() {
  local dir_path="$1"
  local indent="$2"
  local json=""

  json="${indent}{\n"
  json="${json}${indent}  \"path\": \"${dir_path}\",\n"
  json="${json}${indent}  \"files\": [\n"

  local first=true
  for file in "$dir_path"/*; do
    if [ -f "$file" ]; then
      if [ "$first" = true ]; then
        first=false
      else
        json="${json},\n"
      fi
      json="${json}${indent}    \"$(basename "$file")\""
    fi
  done

  json="${json}\n${indent}  ],\n"
  json="${json}${indent}  \"folders\": [\n"

  first=true
  for folder in "$dir_path"/*; do
    if [ -d "$folder" ]; then
      if [ "$first" = true ]; then
        first=false
      else
        json="${json},\n"
      fi
      json="${json}$(generate_json "$folder" "    $indent")"
    fi
  done

  json="${json}\n${indent}  ]\n"
  json="${json}${indent}}"

  echo "$json"
}

# Main script
public_folder="public"
output_file="public/structure.json"

echo "[" > "$output_file"
generate_json "$public_folder" "" >> "$output_file"
echo "]" >> "$output_file"