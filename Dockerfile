FROM        node:5.11.0
RUN         mkdir -p /root/app
WORKDIR     /root/app
COPY        package.json ./
RUN         npm install --production
ADD         ./ ./
EXPOSE      4444
ENTRYPOINT  ["node"]
CMD         ["index.js"]
