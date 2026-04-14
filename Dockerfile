FROM node:20-alpine

WORKDIR /app

COPY apps/api-service/package*.json ./
COPY apps/api-service/tsconfig.json ./

RUN npm install

COPY apps/api-service/src/ ./src/

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]