# Étape 1 : Build Next.js
FROM node:20.18.0 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Étape 2 : Runner
FROM node:20.18.0 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
