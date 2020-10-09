FROM ubuntu:18.04

ENV TZ=America/Bogota

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y git npm nodejs

RUN adduser --system app --home /app
USER app

COPY . /app
WORKDIR /app
RUN npm install

EXPOSE 3000
CMD npm start