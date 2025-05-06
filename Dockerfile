FROM node:23-alpine AS build

WORKDIR /ngs

LABEL maintainer="Yemi Adeoye"

COPY ./package*.json dist .docker.env /ngs/

RUN ["npm", "install", "--omit=dev"]

FROM node:23-alpine

WORKDIR /ngs

COPY --from=build /ngs /ngs/

CMD ["node", "/ngs/server.js"]

EXPOSE 5000

