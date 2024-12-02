# Etapa 1: Construção da aplicação
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

# Etapa 2: Servir a aplicação com um servidor leve
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]