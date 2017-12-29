FROM node:8

WORKDIR /root
COPY . /root

RUN npm install

CMD ["./pokemon-showdown"]
