# Prisma migrations — baseline strategy (no data loss)

Production today relies on `prisma db push` and has **no** `prisma/migrations` history.

## Do not

- `prisma migrate reset`
- `prisma db seed` on production
- Recreate the database
- Change `DATABASE_URL` to a throwaway DB while testing against prod data

## Safe baseline (run when ready, on a maintenance window)

```bash
# 1) Confirm schema matches live DB
npx prisma db pull --print   # inspect only

# 2) Create baseline SQL from current schema (does not apply yet)
mkdir -p prisma/migrations/0_init
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 3) Tell Prisma the baseline is already applied on production
npx prisma migrate resolve --applied 0_init

# 4) Later schema changes
#    local:  npx prisma migrate dev --name describe_change
#    prod:   npx prisma migrate deploy
```

Until this baseline is done, continue using `db push` carefully and only when schema changes are intentional.
