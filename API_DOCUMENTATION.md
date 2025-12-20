# EduResults Hub API Documentation

## Base URL
```
http://localhost:5000/api
```

## Results API Endpoints

### 1. Get All Results
**GET** `/results`

**Query Parameters:**
- `studentId` (optional) - Filter by student ID
- `classId` (optional) - Filter by class ID  
- `subjectId` (optional) - Filter by subject ID
- `examType` (optional) - Filter by exam type (Final Term, Mid Term, Monthly Test)
- `academicYear` (optional) - Filter by academic year
- `search` (optional) - Search by roll ID
- `page` (optional) - Page number for pagination (default: 1)
- `limit` (optional) - Results per page (default: 100)
- `sortBy` (optional) - Sort field (default: createdAt)
- `sortOrder` (optional) - Sort order: asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "total": 150,
  "page": 1,
  "pages": 6,
  "data": [...]
}
```

### 2. Get Single Result
**GET** `/results/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "studentId": {...},
    "classId": {...},
    "subjectId": {...},
    "marks": 85,
    "maxMarks": 100,
    "percentage": 85,
    "grade": "A",
    "examType": "Final Term",
    "academicYear": "2024-2025"
  }
}
```

### 3. Create Result
**POST** `/results`

**Request Body:**
```json
{
  "studentId": "student_object_id",
  "rollId": "STU001",
  "classId": "class_object_id", 
  "subjectId": "subject_object_id",
  "marks": 85,
  "maxMarks": 100,
  "examType": "Final Term",
  "academicYear": "2024-2025"
}
```

**Validation Rules:**
- All fields are required except `academicYear`
- `marks` must be non-negative and ≤ `maxMarks`
- `maxMarks` must be > 0
- `examType` must be one of: "Final Term", "Mid Term", "Monthly Test"
- Student must exist and be active
- Subject must be assigned to the class
- No duplicate results for same student/subject/exam/year combination

### 4. Update Result
**PUT** `/results/:id`

**Request Body:**
```json
{
  "marks": 90,
  "maxMarks": 100,
  "examType": "Final Term"
}
```

**Note:** Only marks, maxMarks, examType, and academicYear can be updated.

### 5. Delete Result
**DELETE** `/results/:id`

### 6. Bulk Create Results
**POST** `/results/bulk`

**Request Body:**
```json
{
  "results": [
    {
      "studentId": "...",
      "rollId": "STU001",
      "classId": "...",
      "subjectId": "...",
      "marks": 85,
      "maxMarks": 100,
      "examType": "Final Term"
    },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk operation completed. 8 results created, 2 errors.",
  "data": {
    "created": [...],
    "errors": [...],
    "summary": {
      "total": 10,
      "successful": 8,
      "failed": 2
    }
  }
}
```

### 7. Get Results by Student
**GET** `/results/student/:studentId`

**Query Parameters:**
- `academicYear` (optional)
- `examType` (optional)

### 8. Get Student Result Summary
**GET** `/results/student/:studentId/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "John Doe",
      "rollId": "STU001",
      "class": "Class 10 - A",
      "fatherName": "Robert Doe"
    },
    "results": [...],
    "summary": {
      "totalSubjects": 5,
      "totalMarks": 425,
      "totalMaxMarks": 500,
      "overallPercentage": 85,
      "overallGrade": "A",
      "passedSubjects": 5,
      "failedSubjects": 0,
      "status": "PASS"
    }
  }
}
```

### 9. Get Results by Class
**GET** `/results/class/:classId`

**Query Parameters:**
- `academicYear` (optional)
- `examType` (optional)
- `subjectId` (optional)

### 10. Get Results by Subject
**GET** `/results/subject/:subjectId`

**Query Parameters:**
- `academicYear` (optional)
- `examType` (optional)
- `classId` (optional)

### 11. Get Result Statistics
**GET** `/results/stats`

**Query Parameters:**
- `academicYear` (optional)
- `classId` (optional)
- `subjectId` (optional)
- `examType` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalResults": 150,
    "overallStats": {
      "avgPercentage": "78.50",
      "maxPercentage": "98.00",
      "minPercentage": "35.00",
      "passRate": "85.33",
      "passCount": 128,
      "failCount": 22,
      "excellentCount": 45
    },
    "gradeDistribution": [
      { "_id": "A+", "count": 25, "percentage": 16.67 },
      { "_id": "A", "count": 30, "percentage": 20.00 },
      ...
    ],
    "avgBySubject": [...],
    "topPerformers": [...],
    "classPerformance": [...]
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Marks cannot be negative", "Subject not found"]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Result not found"
}
```

### Duplicate Entry (409)
```json
{
  "success": false,
  "message": "Result for John Doe in Mathematics (Final Term) already exists for academic year 2024-2025",
  "existingResult": {
    "id": "...",
    "marks": 80,
    "maxMarks": 100,
    "percentage": 80,
    "grade": "A"
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create result",
  "error": "Database connection failed"
}
```

## Grade Calculation

Grades are automatically calculated based on percentage:
- **A+**: 90% and above
- **A**: 80% - 89%
- **B+**: 70% - 79%
- **B**: 60% - 69%
- **C**: 50% - 59%
- **D**: 40% - 49%
- **F**: Below 40%

## Academic Year Format

Academic years follow the format: `YYYY-YYYY+1` (e.g., "2024-2025")

If not provided, the current academic year is automatically calculated based on the current date.

## Professional Features

1. **Comprehensive Validation**: All inputs are validated for type, range, and business rules
2. **Duplicate Prevention**: Prevents duplicate results for same student/subject/exam combination
3. **Relationship Validation**: Ensures student belongs to class, subject is assigned to class
4. **Automatic Calculations**: Percentage and grade calculated automatically
5. **Bulk Operations**: Support for bulk result creation with error reporting
6. **Advanced Statistics**: Comprehensive analytics and reporting
7. **Pagination**: Efficient handling of large datasets
8. **Error Handling**: Professional error responses with detailed messages
9. **Logging**: Request/response logging for debugging and monitoring
10. **Performance**: Optimized database queries with proper indexing