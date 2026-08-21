FROM node:22-alpine AS build
WORKDIR /site
COPY . .
RUN node scripts/build-static.js

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/dist /usr/share/nginx/html
EXPOSE 80
