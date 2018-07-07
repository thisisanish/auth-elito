FROM node:8.11.3-alpine

ARG USER=app
ARG UID=1001
ARG HOME=/home/$USER

RUN adduser -u $UID -s /bin/bash -D -h $HOME $USER
COPY package.json npm-shrinkwrap.json $HOME/code/

RUN  chown -R $USER /home/*

USER $USER
WORKDIR $HOME/code
RUN npm install
EXPOSE 50051
CMD [ "npm","start" ]
