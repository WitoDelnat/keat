FROM node:14-alpine
WORKDIR /app

install:
  COPY package.json ./
  COPY yarn.lock ./
  RUN yarn install
  COPY . .

test:
  FROM +install
  RUN yarn typecheck
  RUN yarn test

build:
  FROM +install
  RUN yarn build
  SAVE ARTIFACT lib AS LOCAL ./lib

publish:
  FROM +test
  COPY +build/lib lib
  ARG NPM_TOKEN
  RUN npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
  RUN npm publish
