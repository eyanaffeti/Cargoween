# Étape 1 : Build Next.js
FROM node:20.18.0 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Donne une valeur factice pour compiler
<<<<<<< HEAD
ENV MONGODB_URI="mongodb://placeholder"
=======
ENV MONGODB_URI="mongodb+srv://eyaneffati86:VMyELufNAtSyPkNu@cargoween.uuqw6qw.mongodb.net/?retryWrites=true&w=majority&appName=cargoween"
>>>>>>> 2e8bbcfa3b500a9402aeea764fe6ccac1d026ad5

RUN npm run build

# Étape 2 : Runner
FROM node:20.18.0 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
