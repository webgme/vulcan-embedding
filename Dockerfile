# This dockerfile is intended to build a docker image on a clean copy of the webgme repository.
#
# Use the following steps to build and start-up your dockerized webgme:
# (assuming that you have docker properly installed on your machine)
# 1. go to the directory where this file exists
# 2. docker build -t webgme .
# 3. docker run -d -p 8888:8888 -v ~/dockershare:/dockershare --name=webgme webgme
#
# N.B. In the third command the ~/dockershare should have the same structure that ./dockershare in this repo has
# and needs to be mapped to /dockershare. However you can put this folder anywhere and point to it when running the container.
#
# The result of your last command will be the hash id of your container. After successful startup,
# you should be able to connect to your dockerized webgme on the 8888 port of your docker daemon machine
# (the default ip address of the daemon is 192.168.99.100).
#
# Useful commands
# checking the status of your docker containers:    docker ps -a
# restart your docker container:                    docker restart webgme
# stop your container:                              docker stop webgme
# removing your container:                          docker rm webgme
# removing your image:                              docker rmi webgme


# https://github.com/nodejs/docker-node/blob/3b038b8a1ac8f65e3d368bedb9f979884342fdcb/6.9/Dockerfile
FROM node:boron
MAINTAINER Patrik Meijer <patrik.meijer@vanderbilt.edu>

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Import MongoDB public GPG key AND create a MongoDB list file
RUN sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.4 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list

RUN sudo apt-get update

# Install mongodb and git
RUN sudo apt-get install -y mongodb-org git

RUN mkdir /usr/app

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install node-modules
RUN npm install --unsafe-perm

# Set environment variable for docker config to be used
ENV NODE_ENV docker

# create startup script (wait till mongo port is open before starting server)
RUN printf '/usr/bin/mongod --smallfiles --dbpath /dockershare/db &\nwhile ! nc -z localhost 27017; do \n  sleep 0.5 \n  echo "Awaiting mongo to listen at 27017" \ndone \nnpm start' >> /root/run.sh


EXPOSE 8888

CMD ["bash", "-xe", "/root/run.sh"]