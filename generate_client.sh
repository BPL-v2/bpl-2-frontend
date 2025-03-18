
JAR_URL="https://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/2.4.44/swagger-codegen-cli-2.4.44.jar"
JAR_FILE="swagger-codegen-cli-2.4.44.jar"
if [ ! -f "$JAR_FILE" ]; then
  echo "Downloading $JAR_FILE..."
  curl -o "$JAR_FILE" "$JAR_URL"
fi

java -jar "$JAR_FILE" generate -i http://localhost:8000/api/swagger/doc.json -l typescript-fetch -o src/client --additional-properties modelPropertyNaming=original,enumPropertyNaming=original,stringEnums=true


# Loop through each file in the directory
for file in src/client/*.ts; do
  # Fix weird enum types 
  sed -i -E "s/= <any> '/= '/g" "$file"
done

# Replace portable-fetch with isomorphic-fetch in src/client/api.ts
sed -i "s/portable-fetch/isomorphic-fetch/g" src/client/api.ts