FROM node:12.18.3 as build
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:12.18.3-slim as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV SERVER_PORT=80
WORKDIR /usr/app
#TODO: uncomment for confd
#COPY ./run.sh ./run.sh
#RUN chmod +x run.sh
COPY package*.json ./
RUN npm install --only=production
COPY ./docs ./docs
#TODO: replace for confd
#COPY ./confd ./confd
COPY ./config ./config
COPY --from=build /usr/src/app/dist .
COPY --from=build /usr/src/app/node_modules ./node_modules

HEALTHCHECK CMD wget http://127.0.0.1:${SERVER_PORT}/liveness -O /dev/null || exit 1

#TODO: replace for confd
#CMD ["./run.sh"]
CMD ["node", "./index.js"]
