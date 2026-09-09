# ---- Etapa 1: Build ----
FROM node:20-alpine AS builder
# Usamos "AS builder" para nombrar esta etapa
# Solo sirve para compilar, no va al contenedor final

WORKDIR /app

COPY package*.json ./
RUN npm install
# Instala TODO (incluyendo devDependencies para poder compilar)

COPY . .
RUN npm run build
# Compila TypeScript → genera carpeta /dist

# ---- Etapa 2: Producción ----
FROM node:20-alpine AS production

RUN apk add --no-cache tzdata

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production
# Solo instala dependencias de producción (más liviano)

COPY --from=builder /app/dist ./dist
# Copia SOLO la carpeta compilada desde la etapa anterior

EXPOSE 4000

CMD ["node", "dist/main.js"]
# Ejecuta directamente el JS compilado, sin TypeScript