# Stage 1: Build the application
FROM node:23-alpine3.20 AS builder

WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Remove the dev dependencies
RUN npm prune --production

# Stage 2: Serve the application
FROM node:23-alpine3.20

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

# Install serve globally
RUN npm install -g serve
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Expose the port and start the server
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]