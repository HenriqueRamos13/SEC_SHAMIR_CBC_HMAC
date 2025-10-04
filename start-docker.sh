#!/bin/bash

docker compose down -v
docker compose rm -f -v
docker volume prune -f
docker compose up -d
