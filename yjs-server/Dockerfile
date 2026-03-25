FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Cloud Run injects process.env.PORT (usually 8080).
# The node server automatically binds to this port.
EXPOSE 8080

CMD ["npm", "start"]