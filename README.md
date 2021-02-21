docker run -e NODE_ENV='production' -e BASE_PATH='/app' -e DEM_PATH='/replays' -v /opt/csgo-stats:/app -v {DEM_SRC_DIR}:/replays -d --restart unless-stopped csgo-stats

docker run -p 8080:8080 -e NODE_ENV='production' -e BASE_PATH='/app' -e DEM_PATH='/replays' -v /home/satheesh:/app/db -v /home/satheesh/Projects/csgo-stats/dist/assets:/replays -d --restart unless-stopped --name csgo-stats satheeshps/csgo-stats

docker exec -it csgo-stats node /app/server/extract.js