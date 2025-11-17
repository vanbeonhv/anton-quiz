#!/bin/bash
# Script to run migrations on production database

echo "Running Prisma migrations on production..."
npx prisma migrate deploy

echo "Migration completed!"
