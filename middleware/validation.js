// Validation middleware for results
export const validateResultInput = (req, res, next) => {
  const { studentId, rollId, classId, subjectId, marks, maxMarks, examType } = req.body;
  const errors = [];

  // Required field validation
  if (!studentId) errors.push('Student ID is required');
  if (!rollId) errors.push('Roll ID is required');
  if (!classId) errors.push('Class ID is required');
  if (!subjectId) errors.push('Subject ID is required');
  if (marks === undefined || marks === null) errors.push('Marks are required');
  if (!maxMarks) errors.push('Maximum marks are required');
  if (!examType) errors.push('Exam type is required');

  // Type validation
  if (marks !== undefined && (isNaN(marks) || marks < 0)) {
    errors.push('Marks must be a non-negative number');
  }
  
  if (maxMarks !== undefined && (isNaN(maxMarks) || maxMarks <= 0)) {
    errors.push('Maximum marks must be a positive number');
  }

  if (marks !== undefined && maxMarks !== undefined && parseFloat(marks) > parseFloat(maxMarks)) {
    errors.push('Marks cannot exceed maximum marks');
  }

  // Exam type validation
  const validExamTypes = ['Final Term', 'Mid Term', 'Monthly Test'];
  if (examType && !validExamTypes.includes(examType)) {
    errors.push(`Exam type must be one of: ${validExamTypes.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation for result updates
export const validateResultUpdate = (req, res, next) => {
  const { marks, maxMarks, examType } = req.body;
  const errors = [];

  // Type validation for provided fields
  if (marks !== undefined && (isNaN(marks) || marks < 0)) {
    errors.push('Marks must be a non-negative number');
  }
  
  if (maxMarks !== undefined && (isNaN(maxMarks) || maxMarks <= 0)) {
    errors.push('Maximum marks must be a positive number');
  }

  if (marks !== undefined && maxMarks !== undefined && parseFloat(marks) > parseFloat(maxMarks)) {
    errors.push('Marks cannot exceed maximum marks');
  }

  // Exam type validation
  const validExamTypes = ['Final Term', 'Mid Term', 'Monthly Test'];
  if (examType && !validExamTypes.includes(examType)) {
    errors.push(`Exam type must be one of: ${validExamTypes.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// MongoDB ObjectId validation
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};