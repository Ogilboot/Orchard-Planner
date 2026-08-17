FROM node:22-alpine

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG DATABASE_URL=file:./dev.db
ARG NEXTAUTH_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef
ARG NEXTAUTH_URL=http://localhost:3000
ENV DATABASE_URL=${DATABASE_URL} NEXTAUTH_SECRET=${NEXTAUTH_SECRET} NEXTAUTH_URL=${NEXTAUTH_URL}

RUN npm run build

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
