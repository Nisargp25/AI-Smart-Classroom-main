# Auth Testing Playbook for IntelliClass LMS

## Step 1: Create Test User & Session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  role: 'student',
  created_at: new Date()
});
db.student_performance.insertOne({
  user_id: userId,
  total_quizzes: 5,
  total_score: 400,
  average_percentage: 80,
  topic_scores: {'Data Structures': 85, 'OOP': 75},
  attendance: 10,
  streak: 3,
  last_active: new Date()
});
db.coding_profiles.insertOne({
  user_id: userId,
  leetcode: {username: 'testuser', problems_solved: 100, easy: 40, medium: 45, hard: 15},
  total_problems: 100,
  coding_score: 20,
  last_synced: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API

```bash
# Get BACKEND_URL
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Test auth endpoint
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test protected endpoints
curl -X GET "$API_URL/api/lectures" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

curl -X GET "$API_URL/api/quizzes" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

curl -X GET "$API_URL/api/rankings" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing

```python
# Set cookie and navigate
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "localhost",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("http://localhost:4000/dashboard")
```

## Quick Debug

```bash
# Check data format
mongosh --eval "
use('test_database');
db.users.find().limit(2).pretty();
db.student_performance.find().limit(2).pretty();
"

# Clean test data
mongosh --eval "
use('test_database');
db.users.deleteMany({email: /test\.user\./});
"
```

## Checklist

- [ ] User document has user_id field (custom UUID)
- [ ] Session user_id matches user's user_id exactly
- [ ] All queries use `{"_id": 0}` projection
- [ ] API returns user data with user_id field
- [ ] Browser loads dashboard without redirect

## Success Indicators

✅ /api/auth/me returns user data
✅ Dashboard loads without redirect
✅ CRUD operations work

## Failure Indicators

❌ "User not found" errors
❌ 401 Unauthorized responses
❌ Redirect to login page
