FROM node:18-alpine
WORKDIR /app

install:
  COPY package.json ./
  COPY package-lock.json ./
  RUN npm install
  COPY . .

test:
  FROM +install
  RUN npm run typecheck
  RUN npm run test

build:
  FROM +install
  RUN npm run build
  SAVE ARTIFACT lib AS LOCAL ./lib

publish:
  FROM +test
  COPY +build/lib lib
  ARG NPM_TOKEN
  RUN npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
  RUN npm publish
