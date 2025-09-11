# Étape 1 : Build de l'application
FROM node:20.18.0 AS builder
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copier le reste du projet
COPY . .

# Build Next.js en production
RUN npm run build

# Étape 2 : Runner optimisé
FROM node:20.18.0 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copier uniquement les fichiers nécessaires depuis builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Exposer le port
EXPOSE 3000

# Lancer l'app Next.js
CMD ["npm", "start"]
