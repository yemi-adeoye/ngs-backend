FROM node:23-alpine AS build

WORKDIR /ngs

LABEL maintainer="Yemi Adeoye"

COPY ./package*.json dist *.env /ngs/

# RUN ["npm", "run", "build"]

RUN ["npm", "install"]

FROM node:23-alpine

WORKDIR /ngs

COPY --from=build /ngs /ngs/

CMD ["node", "/ngs/server.js"]

EXPOSE 5000

