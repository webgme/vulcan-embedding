# This file is an example of how a webgme repo can be dockerized while persisting logs and reading auth keys from
# the host. This setup also shows how to launch a mongo container and link it from the webgme container.
# See ./config/config.docker.js for specific webgme config settings.
#
# Build a docker image for this repository
# 1. make sure docker is installed
# 2. make sure you have a clean copy of this repository
# 3. go to the directory where this file exists (the root of your repo)
# 4. $ docker build -t webgme .
#
# (Docker might require sudo depending on your setup.)
#
# Before running the container make sure to have a running mongo docker container.
# The persisted files from mongo and the logs and auth keys for webgme live outside the containers in this setup.
# Copy the dockershare to ~/dockershare it will be mapped in each of this commands.
#
# Get the latest image from https://hub.docker.com/_/mongo/. At the point of testing this the latest was 3.4.2
# $ docker pull mongo
#
# Start a container from the mongo image. (The container name must be mongo if using the ./config/config.docker.js).
# $ docker run -d -p 27017:27017 -v ~/dockershare/db:/data/db --name mongo mongo
#
# Finally start the webgme app container from the image built here.
# $ docker run -d -p 8888:8888 -v ~/dockershare:/dockershare --link mongo:mongo --name=webgme webgme
#
# After successful startup, you should be able to connect to your dockerized webgme on the 8888 port of the host.
#
# Useful commands
# checking the status of your docker containers:    docker ps -a
# restart your docker container:                    docker restart webgme
# stop your container:                              docker stop webgme
# removing your container:                          docker rm webgme
# removing your image:                              docker rmi webgme
# list available images:                            docker images
# exporting the image:                              docker save -o webgme.tar webgme
# import an image:                                  docker load -i webgme.tar


# https://github.com/nodejs/docker-node/blob/3b038b8a1ac8f65e3d368bedb9f979884342fdcb/6.9/Dockerfile
FROM node:boron
MAINTAINER Patrik Meijer <patrik.meijer@vanderbilt.edu>

RUN apt-get update

# Install git
RUN apt-get install -y git

RUN mkdir /usr/app

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install the node-modules.
RUN npm install

# Webgme is a peer-dependency and needs to be installed explicitly.
RUN npm install webgme

# Set environment variable in order to use ./config/config.docker.js
ENV NODE_ENV docker

EXPOSE 8888

CMD ["npm", "start"]
