FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Where the Next.js server forwards /api/* requests (the NestJS service in docker-compose)
ARG API_INTERNAL_URL=http://api:4000
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
