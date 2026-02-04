FROM jenkins/jenkins:lts

USER root

# Installer Maven, Git, Docker CLI et docker-compose
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        maven \
        git \
        docker.io \
        docker-compose && \
    rm -rf /var/lib/apt/lists/*

USER jenkins

