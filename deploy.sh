#!/bin/bash
set -e
cd ~/cookbook
git reset --hard HEAD
git pull origin main
docker compose up -d --build
docker compose ps
