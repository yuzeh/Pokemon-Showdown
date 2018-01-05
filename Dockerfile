FROM node:8

WORKDIR /root
COPY . /root

RUN npm install
RUN cp config/config-example.js config/config.js

CMD ["./pokemon-showdown"]
