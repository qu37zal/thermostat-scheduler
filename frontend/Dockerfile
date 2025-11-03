# Use official Node.js image for build step
FROM node:14 as build

WORKDIR /usr/src/app

COPY package.json tsconfig.json ./
RUN npm install

COPY public ./public
COPY src ./src

RUN npm run build

# Use nginx to serve the build
FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]