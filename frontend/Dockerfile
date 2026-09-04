

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM node:20-bookworm-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]