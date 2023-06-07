FROM node:18.12.1-slim

COPY ./ ./

RUN npm install

EXPOSE 9999

# CMD ["node", "app.js", "-port", "8080"]
CMD ["node", "src/app.js"]
