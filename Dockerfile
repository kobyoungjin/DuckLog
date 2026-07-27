FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "docker-entrypoint.sh"]
