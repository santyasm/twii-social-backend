FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production=false

COPY . .

RUN npx prisma generate

RUN npx prisma migrate deploy

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
