#!/bin/sh
set -eu
npm run db:deploy
npm run db:seed
exec npm run start
