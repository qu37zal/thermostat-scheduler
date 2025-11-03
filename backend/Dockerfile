# Use official Node.js image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json tsconfig.json ./
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 5555

# Start the server
CMD ["node", "dist/app.js"]