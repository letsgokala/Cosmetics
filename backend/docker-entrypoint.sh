#!/bin/sh
set -eu
npm --workspace @glow/backend run db:deploy
npm --workspace @glow/backend run db:seed
exec npm --workspace @glow/backend run start
