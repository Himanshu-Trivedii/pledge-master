# Backend Error Fix

## Error: "Could not find or load main class"

### Quick Fix:

```bash
cd backend
mvn clean install
```

Then restart your IDE/Spring Boot application.

### Why This Happens:

- Compiled classes are outdated
- IDE cache issue
- Maven dependencies not synced

### Alternative Fix:

**In IntelliJ IDEA:**
1. File → Invalidate Caches / Restart
2. Build → Rebuild Project
3. Run → Spring Boot application

**In Eclipse:**
1. Project → Clean
2. Right-click → Maven → Update Project
3. Run as Java Application

### Verify It Works:

```bash
cd backend
mvn spring-boot:run
```

Should see: "Started PledgeMasterApplication"

### Still Not Working?

1. Check `backend/src/main/java/com/pledge/backend/PledgeMasterApplication.java` exists
2. Delete `backend/target` folder
3. Run: `mvn clean install`
4. Restart IDE

---

## Quick Test:

After fix, backend should start on: http://localhost:8099

Test it:
```bash
curl http://localhost:8099/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Should return JSON response (login may fail if credentials wrong, but server should respond).

