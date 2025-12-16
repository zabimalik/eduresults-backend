# The Oxford City School - Backend API

A comprehensive backend API for The Oxford City School's student result management system.

## 🏫 About

This backend serves The Oxford City School's digital infrastructure, providing APIs for:
- Student management
- Class and subject administration
- Result processing and grade calculation
- Notice board management
- Academic year tracking

## 🚀 Features

- **Student Management**: Complete CRUD operations for student records
- **Class Management**: Class and section organization
- **Subject Management**: Subject creation and combination management
- **Result Processing**: Automated grade calculation and result generation
- **Notice Board**: Announcement and notice management system
- **Academic Tracking**: Multi-year academic record management

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **CORS**: Cross-origin resource sharing enabled

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/oxford-city-school
JWT_SECRET=your-jwt-secret-key
```

5. Start the development server:
```bash
npm run dev
```

## 🗂️ Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── classController.js
│   ├── studentController.js
│   ├── subjectController.js
│   ├── resultController.js
│   ├── noticeController.js
│   └── combinationController.js
├── models/
│   ├── Class.js
│   ├── Student.js
│   ├── Subject.js
│   ├── Result.js
│   ├── Notice.js
│   └── Combination.js
├── routes/
│   ├── classRoutes.js
│   ├── studentRoutes.js
│   ├── subjectRoutes.js
│   ├── resultRoutes.js
│   ├── noticeRoutes.js
│   └── combinationRoutes.js
├── server.js              # Main server file
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/stats` - Get student statistics

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Results
- `GET /api/results` - Get all results
- `POST /api/results` - Create new result
- `PUT /api/results/:id` - Update result
- `DELETE /api/results/:id` - Delete result
- `GET /api/results/stats` - Get result statistics

### Notices
- `GET /api/notices` - Get all notices
- `POST /api/notices` - Create new notice
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

## 🏃‍♂️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🔒 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/oxford-city-school
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## 🏫 School Information

**The Oxford City School**
- Address: Pindi Road, Chakwal
- Phone: 0543-644177, 03390644177
- Email: theoxfordcityschool@gmail.com
- Established: 1985

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary to The Oxford City School.

## 📞 Support

For technical support or questions:
- Email: theoxfordcityschool@gmail.com
- Phone: 0543-644177

---

**© 2024 The Oxford City School. All rights reserved.**