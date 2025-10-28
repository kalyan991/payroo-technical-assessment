# AWS Lambda Node.js 22
FROM public.ecr.aws/lambda/nodejs:22

WORKDIR /var/task

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma

COPY dist ./dist

RUN npx prisma generate

CMD ["dist/lambda.handler"]
