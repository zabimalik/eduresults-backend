# 🚀 Quick Start - Localhost Database

## ⚡ One-Command Setup (Windows)

```bash
cd backend
setup-localhost.bat
```

This will:
1. ✅ Check MongoDB installation
2. ✅ Start MongoDB service
3. ✅ Install dependencies
4. ✅ Create database with sample data
5. ✅ Ready to run!

## 📝 Manual Setup (All Platforms)

### Step 1: Install MongoDB
Download and install from: https://www.mongodb.com/try/download/community

### Step 2: Start MongoDB Service

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 3: Setup Database
```bash
cd backend
npm install
npm run setup-db
```

### Step 4: Start Backend
```bash
npm run dev
```

## 🎯 Test Your Setup

### Backend API
Visit: http://localhost:5000/api/health

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-19T..."
}
```

### Test Student Search
```bash
# Get all students
curl http://localhost:5000/api/students

# Get specific student
curl http://localhost:5000/api/students/year/2024
```

## 📊 Sample Data Available

- **Classes**: 20 (Class 1-10, Sections A & B)
- **Students**: 500 (25 per class)
- **Subjects**: 13 (Math, English, Science, etc.)
- **Results**: Sample results for 50 students
- **Notices**: 5 active notices

### Sample Roll Numbers to Test:
- `1A001` - Student in Class 1 Section A
- `5B015` - Student in Class 5 Section B
- `10A020` - Student in Class 10 Section A

## 🔄 Update Frontend

Edit `eduresults-hub/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Then restart frontend:
```bash
cd eduresults-hub
npm run dev
```

## 🛠️ Useful Commands

```bash
# Reset database with fresh data
npm run setup-db

# Start development server
npm run dev

# Start production server
npm start

# Check MongoDB connection
mongosh mongodb://localhost:27017/oxford-city-school
```

## 📱 Access Points

- **Backend API**: http://localhost:5000/api
- **Frontend**: http://localhost:5173
- **MongoDB**: mongodb://localhost:27017/oxford-city-school

## ✅ Verification Checklist

- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Database setup completed
- [ ] Backend server running on port 5000
- [ ] Frontend connected to localhost API
- [ ] Can search for student results
- [ ] Can view notices

## 🆘 Common Issues

### MongoDB Not Found
```bash
# Add MongoDB to PATH or use full path
"C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Connection Refused
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

---

**You're all set! Happy coding! 🎉**