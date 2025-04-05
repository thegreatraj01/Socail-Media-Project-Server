# syntax=docker/dockerfile:1

# Use a build-time variable for the Node.js version (can be overridden during build)
ARG NODE_VERSION=22.14.0

# Base image with specific Node.js version and Alpine for small image size
FROM node:${NODE_VERSION}-alpine

# Set environment to production (affects dependency installs and some lib behaviors)
ENV NODE_ENV=production

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including dev like nodemon)
# You can optimize this to use --omit=dev in production builds later
RUN npm install

# Copy the rest of your app source code
COPY . .

# Use non-root user provided by the base image (helps prevent security issues)
USER node

# Expose port (this must match the port your app listens on)
EXPOSE 8000

# Default command to run the app using npm script (loads .env via -r dotenv/config)
CMD ["npm", "start"]
