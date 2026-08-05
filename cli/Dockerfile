FROM node:24-alpine

WORKDIR /app

COPY package*.json ./


RUN npm ci

COPY ./ ./

EXPOSE 5173

CMD ["sh", "-c", "echo VITE_API_URL=$VITE_API_URL > .env.local && npm run dev -- --host 0.0.0.0"]