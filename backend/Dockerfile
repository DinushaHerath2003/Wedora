
# Use Node image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build NestJS app
RUN npm run build

# Expose backend port
EXPOSE 3002

# Start app
CMD ["npm", "run", "start:prod"]
