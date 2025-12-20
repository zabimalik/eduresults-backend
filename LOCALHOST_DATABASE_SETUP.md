# 🗄️ Localhost Database Setup Guide

## 📋 Prerequisites

### 1. Install MongoDB Community Server

#### **Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Service (recommended)
5. Install MongoDB Compass (GUI tool) - optional but recommended

#### **macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### **Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Or check the service status
# Windows: Check Services.msc for "MongoDB Server"
# macOS/Linux: 
sudo systemctl status mongod
```

## 🚀 Quick Setup Commands

### 1. Navigate to Backend Directory
```bash
cd "c:\Users\naveed\Desktop\orford school\backend"
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

### 3. Setup Local Database
```bash
npm run setup-db
```

### 4. Start the Backend Server
```bash
npm run dev
```

## 🔧 Configuration Details

### Environment Variables (.env)
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/oxford-city-school

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=oxford-city-school-super-secret-jwt-key-2024

# School Information
SCHOOL_NAME=The Oxford City School
SCHOOL_ADDRESS=Pindi Road, Chakwal
SCHOOL_PHONE_1=0543-644177
SCHOOL_PHONE_2=03390644177
SCHOOL_EMAIL=theoxfordcityschool@gmail.com
```

### Database Connection
The system will connect to:
- **Host**: localhost
- **Port**: 27017 (MongoDB default)
- **Database**: oxford-city-school

## 📊 Sample Data Created

### **Classes (20 total)**
- Class 1 A & B
- Class 2 A & B
- Class 3 A & B
- Class 4 A & B
- Class 5 A & B
- Class 6 A & B
- Class 7 A & B
- Class 8 A & B
- Class 9 A & B
- Class 10 A & B

### **Subjects (13 total)**
- Mathematics (MATH)
- English (ENG)
- Urdu (URD)
- Science (SCI)
- Social Studies (SS)
- Islamic Studies (ISL)
- Computer Science (CS)
- Physics (PHY)
- Chemistry (CHEM)
- Biology (BIO)
- Pakistan Studies (PS)
- Geography (GEO)
- History (HIST)

### **Students (500 total)**
- 25 students per class
- Realistic roll numbers (e.g., 1A001, 1A002, etc.)
- Sample contact information
- All students marked as active

### **Results (Sample for 50 students)**
- Mid Term, Final Term, and Monthly Test results
- Realistic marks and grades
- Proper grade calculation (A+, A, B+, B, C, D, F)
- Current academic year

### **Notices (5 sample notices)**
- Welcome message
- Examination schedules
- Parent-teacher meetings
- Sports events
- General announcements

## 🔍 Database Management

### **MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Browse the `oxford-city-school` database
4. View collections: classes, subjects, students, results, notices, combinations

### **Command Line (mongosh)**
```bash
# Connect to database
mongosh mongodb://localhost:27017/oxford-city-school

# View collections
show collections

# Count documents
db.students.countDocuments()
db.classes.countDocuments()
db.results.countDocuments()

# Sample queries
db.students.find({}).limit(5)
db.classes.find({})
db.results.find({rollId: "1A001"})
```

## 🔄 Switching Between Local and Cloud Database

### **Use Local Database:**
```env
# In backend/.env
MONGO_URI=mongodb://localhost:27017/oxford-city-school
```

### **Use Cloud Database (MongoDB Atlas):**
```env
# In backend/.env
MONGO_URI=mongodb+srv://zabimalik745:Zabi%40786@cluster0.mhu2t.mongodb.net/oxford-city-school
```

## 🛠️ Troubleshooting

### **MongoDB Not Starting**
```bash
# Windows
net start MongoDB

# macOS
brew services restart mongodb/brew/mongodb-community

# Linux
sudo systemctl restart mongod
```

### **Connection Issues**
1. Check if MongoDB service is running
2. Verify port 27017 is not blocked by firewall
3. Ensure .env file has correct MONGO_URI
4. Check MongoDB logs for errors

### **Permission Issues (Linux/macOS)**
```bash
# Fix MongoDB data directory permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

### **Reset Database**
```bash
# Run setup script again to reset with fresh data
npm run setup-db
```

## 📈 Performance Optimization

### **MongoDB Configuration**
Create `/etc/mongod.conf` (Linux/macOS) or edit MongoDB service settings (Windows):

```yaml
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```

### **Indexing for Better Performance**
The setup script automatically creates indexes for:
- Student roll IDs
- Class and subject combinations
- Result queries by student/class/subject

## 🔒 Security Considerations

### **Local Development Security**
- MongoDB runs without authentication by default
- Only accessible from localhost
- Use authentication for production deployments

### **Enable Authentication (Optional)**
```bash
# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Update .env
MONGO_URI=mongodb://admin:your-secure-password@localhost:27017/oxford-city-school?authSource=admin
```

## 📱 Frontend Configuration

### **Update Frontend Environment**
```env
# In eduresults-hub/.env
VITE_API_URL=http://localhost:5000/api
```

### **Test the Connection**
1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in eduresults-hub folder)
3. Visit: http://localhost:5173
4. Test student search with sample roll IDs: 1A001, 2B015, etc.

## 🎯 Next Steps

1. **✅ Install MongoDB**
2. **✅ Run database setup script**
3. **✅ Start backend server**
4. **✅ Update frontend environment**
5. **✅ Test the application**

Your localhost database is now ready for development! 🚀

---

## 📞 Support

If you encounter any issues:
- Check MongoDB service status
- Verify environment variables
- Review server logs
- Ensure all dependencies are installed

**Happy coding!** 💻