# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
# Next.js genera carpeta .next optimizada

# Etapa 2: Producción
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Copia los archivos compilados de Next.js

EXPOSE 3000

CMD ["npm", "run", "start"]
# "start" ejecuta el servidor Next.js en modo producción