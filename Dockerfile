FROM node:22-alpine AS build
WORKDIR /workspace
COPY . .
RUN corepack enable \
  && corepack prepare pnpm@10.15.1 --activate \
  && pnpm install --frozen-lockfile \
  && pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/site/dist /usr/share/nginx/html
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
