# Use a Node.js base image
FROM node:20

# Set the working directory
WORKDIR /

# Copy the monorepo root package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies for the monorepo
RUN yarn install

# Copy the entire monorepo
COPY . .

# Build the project
RUN yarn workspace gm build

# Change to the gm workspace directory
WORKDIR /examples/gm

# Install production dependencies
RUN yarn install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]