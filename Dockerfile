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



FROM ubuntu:14.04.3
MAINTAINER Patrik Meijer <patrik85@isis.vanderbilt.edu>

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# install necessary packages
# install mongodb using the offical mongodb packages
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list

RUN apt-get -qq update --fix-missing
RUN apt-get install -y -q curl
RUN sudo apt-get install -y -q build-essential libssl-dev mongodb-org git

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.5.0

# NVM
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN mkdir /usr/app

#RUN echo smallfiles = true >> /etc/mongodb.conf

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install app dependencies
RUN npm install --unsafe-perm

# Set environment variable for docker config to be used
ENV NODE_ENV docker

# create startup script (wait till mongoo port is open before starting server)
RUN printf '/usr/bin/mongod --dbpath /dockershare/db\nwhile ! nc -z localhost 27017; do \n  sleep 0.5 \ndone \nnpm start' >> /root/run.sh


EXPOSE 8888

CMD ["bash", "-xe", "/root/run.sh"]