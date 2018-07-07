FROM alpine:latest

COPY my.cnf /etc/mysql/my.cnf
WORKDIR /app
RUN apk add --update mysql mysql-client && rm -f /var/cache/apk/*
COPY startup.sh /app/
RUN chmod 755 startup.sh

EXPOSE 3306
CMD ["/app/startup.sh"]
