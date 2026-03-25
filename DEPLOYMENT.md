# Professional Deployment Guide

## Pre-Deployment Checklist

### 1. Code Review & Cleanup
- [ ] Review all recent changes and commits
- [ ] Verify no debug logs or console.logs remain
- [ ] Check for hardcoded credentials or sensitive data
- [ ] Ensure no commented-out code blocks
- [ ] Run linters and formatters

### 2. Backend Preparation
- [ ] Review Python dependencies in `pyproject.toml`
- [ ] Run test suite: `pytest backend/tests/`
- [ ] Check API endpoints are documented
- [ ] Verify database migrations are complete
- [ ] Validate environment variables are configured

### 3. Frontend Preparation
- [ ] Run `npm run lint` and fix any issues
- [ ] Run `npm run build` to verify build succeeds
- [ ] Test in production mode: `npm run preview`
- [ ] Verify all API endpoints are correct
- [ ] Check for unused imports and dependencies
- [ ] Optimize images and assets

### 4. Data & Database
- [ ] Backup current database
- [ ] Verify seed data is anonymized and sanitized
- [ ] Test data migrations locally
- [ ] Validate all 1,068 use cases load correctly
- [ ] Check vector embeddings are properly indexed

### 5. Documentation
- [ ] Update README.md with latest changes
- [ ] Document any configuration changes
- [ ] Update DECISIONS.md with this release's decisions
- [ ] Document breaking changes (if any)
- [ ] Update API documentation

### 6. Version & Git
- [ ] Determine version number (semantic versioning: major.minor.patch)
- [ ] Create release notes
- [ ] Commit all changes with descriptive messages
- [ ] Create a release branch or tag
- [ ] Push to remote repository

### 7. Testing in Staging
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify all core features work
- [ ] Test with real/production-like data
- [ ] Performance testing if needed

### 8. Production Deployment
- [ ] Final verification all checks passed
- [ ] Create deployment plan with rollback strategy
- [ ] Deploy containers
- [ ] Monitor application logs
- [ ] Verify all services are running
- [ ] Run health checks
- [ ] Perform spot checks on key features

---

## Step-by-Step Deployment Commands

### Phase 1: Prepare Code for Release

```bash
# 1. Check git status
git status

# 2. Stage all changes
git add .

# 3. Create a descriptive commit message
git commit -m "Release v1.0.0: Remove commercial names, anonymize descriptions, implement feedback feature"

# Example message format:
# Release v1.0.0: Data anonymization & feedback integration
# 
# - Remove commercial brand names from use case titles
# - Anonymize descriptions and AI solution fields
# - Implement decision and outcome feedback system
# - Fix ESLint 9 compatibility
# - Enhance UI polish and accessibility
```

### Phase 2: Verify Docker & Services

```bash
# 1. Stop existing services
docker compose down

# 2. Clean up volumes (if needed for fresh start)
# docker compose down -v  # WARNING: Deletes data

# 3. Rebuild images with latest code
docker compose build

# 4. Start services
docker compose up -d

# 5. Verify all services are healthy
docker compose ps
```

### Phase 3: Run Tests

```bash
# 1. Run backend tests
docker compose exec -T backend pytest tests/ -v

# 2. Run specific test suites
docker compose exec -T backend pytest tests/test_api_score.py -v
docker compose exec -T backend pytest tests/test_api_session.py -v

# 3. Check API responses
curl http://localhost:8000/api/v1/usecases
curl http://localhost:8000/api/v1/session
```

### Phase 4: Seed & Verify Data

```bash
# 1. Seed database
docker compose exec -T backend python scripts/seed_db.py

# 2. Seed vector embeddings
docker compose exec -T backend python scripts/seed_qdrant.py

# 3. Verify data count
docker compose exec -T backend python -c \
  "from app.models.database import init_db; \
   from sqlalchemy.orm import Session; \
   db = init_db(); \
   count = db.query(UseCase).count(); \
   print(f'Use cases in DB: {count}')"
```

### Phase 5: Build Frontend for Production

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm ci  # or npm install

# 3. Build for production
npm run build

# 4. Verify build output
ls -la dist/

# 5. Test production build
npm run preview
```

### Phase 6: Git Push & Release

```bash
# 1. Create a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# 2. Push commits to main branch
git push origin main

# 3. Push tags
git push origin --tags

# 4. Create release notes on GitHub/platform
# - Go to Releases
# - Create new release from v1.0.0 tag
# - Add detailed release notes with:
#   * Features added
#   * Bugs fixed
#   * Breaking changes (if any)
#   * Migration steps
```

---

## Deployment Verification Checklist

### Functional Tests
- [ ] Load home page: http://localhost:5173
- [ ] View use cases list
- [ ] Search functionality works
- [ ] Scoring displays correctly
- [ ] Radar visualization loads
- [ ] Feedback form opens and submits
- [ ] Check no "Wells Fargo", "Salesforce", "Google Cloud" appears in descriptions
- [ ] Verify anonymized titles display (e.g., "AI-Powered Customer Service")

### Performance Checks
- [ ] API response time < 500ms
- [ ] Frontend loads in < 3 seconds
- [ ] Search returns results < 1 second
- [ ] No console errors in browser DevTools

### Security Checks
- [ ] No hardcoded credentials in logs
- [ ] API requires authentication where needed
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed

### Database Checks
- [ ] PostgreSQL is healthy and connected
- [ ] All 1,068 use cases are present
- [ ] Vector DB (Qdrant) has all embeddings
- [ ] Redis cache is operational

---

## Rollback Plan

If issues occur in production:

```bash
# 1. Revert to previous tag
git checkout v0.9.0-previous-version

# 2. Rebuild and restart services
docker compose down
docker compose build
docker compose up -d

# 3. If database issues, restore from backup
# psql -U user -d database < backup.sql

# 4. Clear caches
docker compose exec -T redis redis-cli FLUSHALL
```

---

## Post-Deployment

- [ ] Monitor logs for errors: `docker compose logs -f`
- [ ] Check application metrics
- [ ] Gather feedback from users
- [ ] Plan next iteration
- [ ] Document any issues encountered

---

## Release Notes Template

```markdown
# Release v1.0.0 - Data Anonymization & Feedback Integration

## 🎯 Overview
Professional release with complete data sanitization and feedback capabilities.

## ✨ New Features
- **Decision Feedback**: Users can provide feedback on use case decisions
- **Outcome Tracking**: Record implementation outcomes and KPIs
- **Anonymized Catalog**: All commercial brand names removed from use cases

## 🔧 Improvements
- Enhanced UI polish with gradient effects
- Improved radar visualization
- Better error handling and user feedback

## 🐛 Bug Fixes
- Fixed ESLint 9 compatibility issues
- Resolved npm security vulnerabilities
- Fixed sector normalization in search

## 📋 Migration Guide
- Database is automatically migrated on startup
- Vector embeddings are regenerated
- No manual steps required

## ⚠️ Breaking Changes
None - fully backward compatible

## 🚀 Deployment
See DEPLOYMENT.md for detailed deployment steps
```

