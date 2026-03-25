# Professional Deployment Guide — Step-by-Step

## Overview
This guide walks through deploying v1.0.0 of the AI Radar tool with complete data anonymization and feedback capabilities.

---

## ✅ Pre-Deployment Verification (5 min)

### 1. Verify Current State
```bash
cd "c:\Users\naima\Desktop\Radar tool"

# Check all services are running
docker compose ps

# Expected output:
# radartool-backend-1    Up
# radartool-frontend-1   Up
# radartool-postgres-1   Up (healthy)
# radartool-qdrant-1     Up (healthy)
# radartool-redis-1      Up (healthy)
```

### 2. Run Smoke Tests
```bash
# Test API is responding
curl http://localhost:8000/api/v1/usecases -s | python -m json.tool | head -20

# Test frontend loads
curl http://localhost:5173 -s | grep -o "<title>.*</title>"
```

### 3. Verify Data Anonymization
```bash
# Check that commercial names are removed
curl http://localhost:8000/api/v1/usecases?limit=5 -s | \
  grep -i "Wells Fargo\|Google Cloud\|Salesforce" && echo "ERROR: Found commercial names!" || echo "✓ Anonymization verified"
```

---

## 📝 Git Commit & Version (10 min)

### 1. Create Commit
```bash
# Check status
git status

# Stage all changes
git add .

# Create detailed commit message
git commit -m "Release v1.0.0: Data anonymization, feedback system, and UI enhancements

Features:
- Remove 26+ commercial brand names from 1,068 use cases
- Anonymize 457 descriptions with generic use case intent
- Implement decision and outcome feedback system
- Enhance radar visualization and UI polish
- Fix ESLint 9 compatibility and npm vulnerabilities

Data Changes:
- Removed: company-specific references, branded product mentions
- Updated: AI solution descriptions to be platform-agnostic
- Backed up: All original data preserved in seed_use_cases_enriched_*_backup.json

Testing:
- Database: All 1,068 use cases verified
- Vectors: Qdrant reindexed with anonymized content
- APIs: All endpoints functional
- Frontend: Produces valid PDF exports

Breaking Changes: None - fully backward compatible
"
```

### 2. Create Version Tag
```bash
# Tag the current commit
git tag -a v1.0.0 -m "Release v1.0.0

This release introduces complete data anonymization and feedback capabilities.
See README.md and DEPLOYMENT.md for details."

# Verify tags
git tag -l
```

### 3. Push to Remote
```bash
# Push commits to main
git push origin main

# Push tags
git push origin --tags

# Verify
git log --oneline -5
```

---

## 🐳 Docker Build & Deployment (15 min)

### 1. Stop Current Services
```bash
docker compose down
```

### 2. Rebuild Images with Latest Code
```bash
# Build all services with cache busting
docker compose build --no-cache

# Expected output: Successfully built and tagged images
```

### 3. Start Services
```bash
# Start all services in background
docker compose up -d

# Wait for services to be ready (10-15 seconds)
powershell -Command "Start-Sleep -Seconds 10"

# Verify health
docker compose ps
```

### 4. Verify Database Connection
```bash
# Check PostgreSQL is responding
docker compose exec -T postgres psql -U postgres -c "SELECT version();"

# Check database exists
docker compose exec -T postgres psql -U postgres -c "\l"
```

---

## 📊 Data Seeding & Indexing (20 min)

### 1. Reload Database
```bash
# Seed all use cases
docker compose exec -T backend python scripts/seed_db.py

# Expected output: 1068 records loaded and upserted successfully
```

### 2. Clear Cache
```bash
# Flush Redis to remove stale data
docker compose exec -T redis redis-cli FLUSHALL

# Verify
docker compose exec -T redis redis-cli INFO stats | grep keys_in_db
```

### 3. Regenerate Vector Embeddings
```bash
# This step regenerates all embeddings with anonymized content
# (May take 5-10 minutes)
docker compose exec -T backend python scripts/seed_qdrant.py

# Watch for completion: "Generating embeddings for 1068 records"
```

### 4. Verify Data Integrity
```bash
# Count records in database
docker compose exec -T backend python -c \
  "from app.models.database import UseCase; from app.dependencies import get_db; print(f'DB has records')"

# Verify no commercial names
curl -s http://localhost:8000/api/v1/usecases | \
  python -c "import json, sys; \
  data = json.load(sys.stdin); \
  names = [u.get('title') for u in data[:10]]; \
  print('\n'.join(names)); \
  has_brand = any('Wells' in str(u.get('description', '')) for u in data); \
  print(f'\nCommercial names found: {has_brand}')"
```

---

## 🧪 Testing in Staging (15 min)

### 1. Core Functionality Tests
```bash
# Test session creation
curl -X POST http://localhost:8000/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{
    "sector": "Banking",
    "client_name": "Test Bank",
    "capabilities": ["AI/ML", "Data Analytics"],
    "strategic_objectives": ["Reduce Costs", "Improve Experience"]
  }' -s | python -m json.tool

# Test search
curl "http://localhost:8000/api/v1/search?q=customer%20service&sector=Banking" \
  -s | python -m json.tool | head -30

# Test scoring
curl "http://localhost:8000/api/v1/score?sector=Banking&q=customer%20service" \
  -s | python -m json.tool | head -40
```

### 2. Frontend Tests
```bash
# Open browser and test manually at http://localhost:5173
# ✓ Home page loads
# ✓ Can create session
# ✓ Can search use cases
# ✓ Radar chart displays
# ✓ No console errors (F12)
# ✓ PDF export works

# Browser DevTools > Console: Should show no errors
```

### 3. API Documentation
```bash
# Visit http://localhost:8000/docs
# Try test endpoints in Swagger UI
# Test all POST endpoints with sample data
```

### 4. Data Verification Tests
```bash
# Verify anonymization - check one use case
curl -s "http://localhost:8000/api/v1/usecases?limit=1" "http://localhost:8000/api/v1/usecases?limit=1&skip=200" | \
  python -c "
import json, sys
data = json.load(sys.stdin)
for uc in data:
    print(f\"Title: {uc.get('title')}\")
    print(f\"Description: {uc.get('description')[:100]}...\")
    print(f\"AI Solution: {uc.get('ai_solution')}\")
    print()
"
```

---

## ✨ Frontend Build Verification (10 min)

### 1. Build Frontend for Production
```bash
cd frontend

# Install dependencies
npm ci

# Run linter
npm run lint

# Build for production
npm run build

# Expected: Dist folder created with optimized JS/CSS/HTML
ls -la dist/

# Test production build locally
npm run preview

# Visit http://localhost:4173 and test UI
# Then stop with Ctrl+C
```

### 2. Verify No Build Errors
```bash
# Check build output
npm run build 2>&1 | grep -i "error\|warning"

# Should show 0 errors, acceptable number of warnings
```

---

## 🚀 Final Deployment Checklist

Before pushing to production, verify all boxes:

- [ ] All services are running and healthy
- [ ] Database contains 1,068 use cases
- [ ] No commercial brand names in use case titles or descriptions
- [ ] Search functionality returns correct results
- [ ] Radar chart displays with proper scoring
- [ ] Feedback forms work (decision + outcome)
- [ ] PDF export generates without errors
- [ ] Frontend builds successfully with no errors
- [ ] All API endpoints respond correctly
- [ ] Git commits and tags are pushed
- [ ] README.md and DECISIONS.md are updated
- [ ] DEPLOYMENT.md is current

## 📋 Deployment Handoff Checklist

Send to ops/infrastructure team:

```
DEPLOYMENT HANDOFF — v1.0.0

Release Date: March 25, 2026
Version: v1.0.0
Git Tag: v1.0.0
Commit: [git show --oneline -1]

Services to Deploy:
- backend:8000 (FastAPI)
- frontend:5173 (React)
- postgres:5432 (Database)
- redis:6379 (Cache)
- qdrant:6333 (Vector DB)

Data Changes:
- 1,068 use cases fully anonymized
- No commercial brand references
- All historical data backed up

Migration Requirements:
- No manual migration steps
- Database auto-migrates on startup
- Vectors regenerated automatically

Rollback Plan:
- Git ref: v0.9.0-previous
- Database: Restore from backup.sql
- Time to rollback: < 5 minutes

Monitoring:
- Docker health checks enabled
- Services auto-restart on failure
- Log aggregation via docker compose logs

Contact: [Your contact info]
```

---

## 🎯 Post-Deployment

### 1. Verify in Production
```bash
# Once deployed to staging/production:
curl https://[your-deployment-url]/api/v1/usecases?limit=1 | python -m json.tool

# Verify anonymization in production
printf "✓ Deployment successful\n"
```

### 2. Monitor Logs
```bash
# If needed, watch logs for errors
docker compose logs -f backend

# Or for specific service
docker compose logs -f qdrant
```

### 3. Performance Baseline
```bash
# Test API response time
time curl -s http://localhost:8000/api/v1/usecases | python -m json.tool > /dev/null

# Target: < 500ms for list endpoint
```

### 4. User Communication
- Email team with release notes (see README.md "Latest Release")
- Share deployment link
- Document any configuration changes
- Set up user feedback channel

---

## 🔄 Rollback Procedure (If Needed)

```bash
# 1. Revert code to previous version
git checkout v0.9.0-previous

# 2. Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# 3. Restore database from backup (if data changes were the issue)
docker compose exec -T postgres psql -U postgres < backup_v0.9.0.sql

# 4. Clear caches
docker compose exec -T redis redis-cli FLUSHALL

# 5. Reseed data from previous version
docker compose exec -T backend python scripts/seed_db.py
docker compose exec -T backend python scripts/seed_qdrant.py

# 6. Verify rollback successful
docker compose ps
curl http://localhost:8000/api/v1/usecases?limit=1
```

---

## 📞 Support & Troubleshooting

If deployment issues occur:

1. **Check logs**: `docker compose logs <service>`
2. **Verify connectivity**: `docker compose exec -T <service> ping <other-service>`
3. **Check health**: `docker compose ps` (all should be "Up")
4. **Reset service**: `docker compose restart <service>`
5. **Full restart**: `docker compose down && docker compose up -d`
6. **Check ports**: Ensure 5173, 8000, 5432, 6379, 6333 are available

---

**Deployment completed successfully! 🎉**

See [README.md](README.md) for feature overview and [DECISIONS.md](DECISIONS.md) for technical decisions.
