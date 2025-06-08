FROM node:22-alpine AS build

# Install build tools needed to compile native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Optional but recommended: rebuild bcrypt to ensure it's compiled for Alpine
RUN npm rebuild bcrypt --build-from-source

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app /app

ENV NODE_ENV=production

EXPOSE 3000

CMD [ "sh", "-c", "npm run migrate && npm run seed && npm start" ]