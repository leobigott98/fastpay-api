# --- ETAPA 1: Construcción (Build) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiamos el código fuente y el tsconfig
COPY . .

# Compilamos el proyecto (genera la carpeta /dist)
RUN npm run build

# --- ETAPA 2: Producción (Runner) ---
FROM node:20-alpine AS runner

# Definimos el entorno como producción
ENV NODE_ENV=production

WORKDIR /app

# Copiamos solo los archivos necesarios de la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalamos solo las dependencias de producción (omite typescript, vitest, etc.)
RUN npm install --omit=dev

# Seguridad: No correr como root. Usamos el usuario 'node' que viene en la imagen
USER node

# Exponemos el puerto (asegúrate que coincida con env.PORT)
EXPOSE 3000

# Comando para arrancar la API
CMD ["node", "dist/server.js"]