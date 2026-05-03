FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY package*.json ./

EXPOSE 3001

CMD ["sh", "-c", "npm run prisma:deploy && npm run seed && node dist/main.js"]
