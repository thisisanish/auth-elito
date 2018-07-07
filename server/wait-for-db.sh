#!/bin/sh

script=$1

flag="unavailable"
while [ "$flag" == "unavailable" ];do
    flag="$(node wait-for-db.js)"
done

echo "Database available -- starting..."
exec npm run $1