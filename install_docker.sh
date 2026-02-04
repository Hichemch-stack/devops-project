#!/bin/bash
set -e

apt update
apt install -y docker.io docker-compose
apt install -y docker-compose-plugin
systemctl enable docker
systemctl start docker


