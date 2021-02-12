FROM node:8

WORKDIR /app
COPY ./dist/ /app/
RUN npm install --production
EXPOSE 8080

CMD ["npm", "start"]
