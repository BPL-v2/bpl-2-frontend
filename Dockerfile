# Stage 1: Build the application
FROM node:23-alpine3.20 AS builder

WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package.json and package-lock.json to install dependencies
COPY deno.lock ./
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
## used for enumerating public images - but not really needed
# RUN ./generate_file_structure.sh

# Build the application
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN echo "VITE_BACKEND_URL=${VITE_BACKEND_URL}" > .env
RUN npm run build

# Remove the dev dependencies
RUN npm prune --production

# Stage 2: Serve the application
FROM nginx:1.27.4-alpine

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app/dist

# Expose the port and start the server
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]