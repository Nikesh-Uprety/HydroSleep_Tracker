# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=5001
# Ensure your MongoDB Atlas URI is passed via environment variable in docker-compose or runtime

EXPOSE 5001

CMD ["node", "src/index.js"]
