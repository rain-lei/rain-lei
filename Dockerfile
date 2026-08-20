FROM node:22-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
