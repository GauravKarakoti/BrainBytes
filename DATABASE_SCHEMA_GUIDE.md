# Database Schema Consistency Guide

## Overview
This document explains the schema consistency checks implemented in the CI/CD pipeline to prevent schema drift and ensure migrations are always in sync with TypeScript definitions.

## What is Schema Drift?

**Schema Drift** occurs when:
- You modify `db/schema/*.ts` files (TypeScript definitions)
- But don't generate corresponding migration files in `drizzle/`
- The committed code no longer accurately reflects the database state

This can cause:
- ❌ Failed deployments
- ❌ Data corruption issues
- ❌ Inconsistencies between environments
- ❌ Debugging nightmares

## CI Pipeline Checks (Enhanced)

### 1. **Drizzle-Kit Check** (`drizzle-kit check`)
```bash
pnpm drizzle-kit check
```
Validates the Drizzle configuration and detects potential issues with schema definitions.

### 2. **Drizzle-Kit Generate** (`drizzle-kit generate`)
```bash
pnpm drizzle-kit generate
```
Generates migration previews based on schema changes. This command is non-destructive and shows what migrations would be created.

### 3. **Schema Drift Detection**
```bash
git diff drizzle/
```
After generation, the CI checks if any new migration files would be created. If `drizzle/` directory changes, the PR fails with:
```
❌ Schema drift detected - uncommitted migrations exist
```

### 4. **Conflict Detection**
Automatically scans for migration conflict markers that might indicate manual merge issues.

### 5. **TypeScript Validation**
```bash
pnpm tsc --noEmit db/
```
Ensures all database layer code is type-safe.

## How to Use Locally

### When You Modify Schema

1. **Make schema changes** in `db/schema/`:
   ```typescript
   // Example: Add new column
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     email: varchar('email', { length: 255 }).notNull(),
     newField: varchar('new_field', { length: 255 }), // NEW!
   })
   ```

2. **Generate migrations**:
   ```bash
   pnpm db:gen
   ```

3. **Review generated migration**:
   ```bash
   cat drizzle/[timestamp]_[description].sql
   ```

4. **Commit both**:
   ```bash
   git add db/schema/
   git add drizzle/
   git commit -m "feat: Add newField to users table"
   ```

### Avoid Common Mistakes

❌ **DON'T**: Modify schema without generating migrations
```bash
# Bad: Just editing db/schema without running db:gen
git add db/schema/
git commit -m "Add column"  # ❌ Will fail CI!
```

✅ **DO**: Always generate migrations after schema changes
```bash
# Good: Generate migrations first
pnpm db:gen
git add db/schema/ drizzle/
git commit -m "Add column"  # ✅ Passes CI
```

❌ **DON'T**: Manually edit migration files
```bash
# Bad: Hand-editing SQL files
vim drizzle/[timestamp].sql  # ❌ Easy to break
```

✅ **DO**: Let Drizzle-Kit generate migrations
```bash
# Good: Let tools generate correct migrations
pnpm db:gen  # ✅ Proper SQL generation
```

## PR CI Feedback

When you create a PR, the CI will post a comment like:

### ✅ Success Case
```
✅ Database schema verification passed.
📁 Found 5 schema file(s).

✅ **Schema Consistency**: All migrations are properly committed.
✔️ No schema drift detected between TypeScript definitions and migration files.

### Database CI Checks
- Schema format validation
- TypeScript type checking
- Migration conflict detection
- Schema drift verification
```

### ❌ Failure Case
```
⚠️ **Schema Drift Warning**: Uncommitted migrations detected!
Please run `pnpm db:gen` and commit the generated migrations.

=== Changes in drizzle/ directory ===
A drizzle/0010_new_migration.sql
A drizzle/meta/[timestamp]_snapshot.json
```

**How to fix**:
1. Run: `pnpm db:gen`
2. Review: `git diff drizzle/`
3. Commit: `git add drizzle/ && git commit -m "migrations: add generated migrations"`
4. Push: `git push`
5. CI will pass on next push

## Database Scripts

Available npm scripts:

```bash
# Generate migrations from schema changes
pnpm db:gen

# Apply migrations to database
pnpm db:migrate

# Interactive database explorer
pnpm db:studio

# Push schema to database
pnpm db:push

# Seed database
pnpm db:seed

# Update user data
pnpm db:update-users
```

## Deployment Process

### Pre-Deployment
1. ✅ All CI checks pass
2. ✅ Schema drift detection passes
3. ✅ TypeScript validation passes

### Deployment
1. Pull latest code with migrations
2. Run: `pnpm db:migrate` (applies pending migrations)
3. Deploy application code
4. Verify in monitoring

### Post-Deployment
1. Check database logs
2. Verify users can still authenticate
3. Monitor performance metrics

## Troubleshooting

### Issue: "Schema drift detected"

**Solution**: Run migrations locally and commit them
```bash
pnpm db:gen
git add drizzle/
git commit -m "migrations: sync schema"
git push
```

### Issue: "Migration conflicts"

**Solution**: Check for conflict markers in migration files
```bash
grep -r "<<<<<" drizzle/  # Find conflicts
# Edit manually to resolve
pnpm db:gen  # Regenerate if needed
```

### Issue: Database out of sync locally

**Solution**: Reset and regenerate
```bash
# Careful! This wipes local test data
pnpm db:push --force

# Or if you need to test migrations
pnpm db:migrate
```

## FAQ

**Q: Do I need to manually write SQL migrations?**
A: No! Use `pnpm db:gen` to automatically generate them from TypeScript.

**Q: Can I edit migration files manually?**
A: Generally no. If you must, regenerate with `pnpm db:gen` after making schema changes to ensure consistency.

**Q: What if my schema and migrations disagree?**
A: The CI will catch this and fail the PR. Always run `pnpm db:gen` after schema changes.

**Q: How often should I commit migrations?**
A: Every time you change `db/schema/`, run `pnpm db:gen` and commit the result.

## Related Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Migrations Guide](https://orm.drizzle.team/docs/migrations)
- [Schema Validation](https://orm.drizzle.team/docs/column-types)

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review recent migrations in `drizzle/`
3. Check the CI logs on GitHub
4. Ask in #database channel
