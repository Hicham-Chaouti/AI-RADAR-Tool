FROM node:20-slim

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json ./

# Clean install - remove any cached dependencies
RUN rm -rf node_modules package-lock.json && npm cache clean --force

# Install with build tools available to compile native modules
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
