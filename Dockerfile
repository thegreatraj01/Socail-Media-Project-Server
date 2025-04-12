# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Make sure the folder exists and set ownership & permissions
RUN mkdir -p public/temp && \
    chown -R node:node public && \
    chmod -R 755 public/temp

USER node

EXPOSE 8000

CMD ["npm", "start"]
