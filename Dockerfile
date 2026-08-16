FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
