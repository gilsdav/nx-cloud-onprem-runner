FROM node:12 AS builder
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM node:12-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/nx-cloud-onprem ./
COPY --from=builder /app/node_modules ./node_modules/
CMD ["node", "main.js"]
