FROM node:22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc --skipLibCheck || true

FROM public.ecr.aws/lambda/nodejs:22
WORKDIR /var/task

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema.prisma

CMD ["dist/lambda.handler"]
