FROM postgres:18-alpine

RUN apk add --no-cache postgis \
    && ln -s /usr/share/postgresql18/extension/postgis* /usr/local/share/postgresql/extension/ \
    && ln -s /usr/lib/postgresql18/postgis*.so /usr/local/lib/postgresql/