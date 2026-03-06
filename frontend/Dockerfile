FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html ./
COPY vite.config.ts tsconfig.json postcss.config.js tailwind.config.js ./
COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


