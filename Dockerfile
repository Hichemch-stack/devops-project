FROM jenkins/jenkins:lts

USER root

RUN apt-get update && apt-get install -y \
    git \
    maven \
    docker.io \
    docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

USER jenkins
