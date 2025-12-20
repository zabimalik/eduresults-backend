import Result from "../models/Result.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import Combination from "../models/Combination.js";

// Helper function to calculate grade
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

// Helper function to validate marks
const validateMarks = (marks, maxMarks) => {
  if (marks < 0) return 'Marks cannot be negative';
  if (marks > maxMarks) return 'Marks cannot exceed maximum marks';
  if (maxMarks <= 0) return 'Maximum marks must be greater than 0';
  return null;
};

// Helper function to build search filter
const buildSearchFilter = (search) => {
  if (!search) return {};
  
  return {
    $or: [
      { rollId: { $regex: search, $options: 'i' } },
      // We'll also search in populated fields using aggregation if needed
    ]
  };
};

// @desc    Get all results with advanced filtering
// @route   GET /api/results
// @access  Public
export const getResults = async (req, res) => {
  try {
    const { 
      studentId, 
      classId, 
      subjectId, 
      examType, 
      academicYear, 
      search,
      page = 1,
      limit = 100,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (examType) filter.examType = examType;
    if (academicYear) filter.academicYear = academicYear;
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { rollId: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const totalResults = await Result.countDocuments(filter);

    const results = await Result.find(filter)
      .populate('studentId', 'name rollId fatherName phone')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: results.length,
      total: totalResults,
      page: parseInt(page),
      pages: Math.ceil(totalResults / parseInt(limit)),
      data: results,
    });
  } catch (error) {
    console.error('Get Results Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Public
export const getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'name rollId fatherName')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new result with comprehensive validation
// @route   POST /api/results
// @access  Public
export const createResult = async (req, res) => {
  try {
    const { 
      studentId, 
      rollId, 
      classId, 
      subjectId, 
      marks, 
      maxMarks, 
      examType, 
      academicYear 
    } = req.body;

    // Input validation
    if (!studentId || !rollId || !classId || !subjectId || marks === undefined || !maxMarks || !examType) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: ["studentId", "rollId", "classId", "subjectId", "marks", "maxMarks", "examType"]
      });
    }

    // Validate marks
    const marksError = validateMarks(parseFloat(marks), parseFloat(maxMarks));
    if (marksError) {
      return res.status(400).json({
        success: false,
        message: marksError,
      });
    }

    // Validate that student exists and is active
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot add result for inactive student",
      });
    }

    // Validate that class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Validate that subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Validate that the subject is assigned to the class
    const combination = await Combination.findOne({
      classId: classId,
      subjectId: subjectId,
      isActive: true
    });

    if (!combination) {
      return res.status(400).json({
        success: false,
        message: `Subject ${subject.name} is not assigned to this class or is inactive`,
      });
    }

    // Validate that student belongs to the specified class
    if (student.classId._id.toString() !== classId) {
      return res.status(400).json({
        success: false,
        message: "Student does not belong to the specified class",
      });
    }

    // Validate roll ID matches
    if (student.rollId.toUpperCase() !== rollId.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: "Roll ID does not match student record",
      });
    }

    // Generate academic year if not provided
    let finalAcademicYear = academicYear;
    if (!finalAcademicYear) {
      const currentYear = new Date().getFullYear();
      finalAcademicYear = `${currentYear}-${currentYear + 1}`;
    }

    // Check if result already exists for this combination
    const existingResult = await Result.findOne({
      studentId,
      subjectId,
      examType,
      academicYear: finalAcademicYear,
    });

    if (existingResult) {
      return res.status(409).json({
        success: false,
        message: `Result for ${student.name} in ${subject.name} (${examType}) already exists for academic year ${finalAcademicYear}`,
        existingResult: {
          id: existingResult._id,
          marks: existingResult.marks,
          maxMarks: existingResult.maxMarks,
          percentage: existingResult.percentage,
          grade: existingResult.grade
        }
      });
    }

    // Create the result
    const result = await Result.create({
      studentId,
      rollId: rollId.toUpperCase(),
      classId,
      subjectId,
      marks: parseFloat(marks),
      maxMarks: parseFloat(maxMarks),
      examType,
      academicYear: finalAcademicYear,
    });

    // Populate the created result
    const populatedResult = await Result.findById(result._id)
      .populate('studentId', 'name rollId fatherName')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    res.status(201).json({
      success: true,
      message: `Result added successfully for ${student.name} in ${subject.name}`,
      data: populatedResult,
    });
  } catch (error) {
    console.error('Create Result Error:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key error
      const duplicateField = Object.keys(error.keyPattern)[0];
      res.status(409).json({
        success: false,
        message: `Result with this ${duplicateField} combination already exists`,
      });
    } else if (error.name === 'ValidationError') {
      // Handle mongoose validation errors
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create result",
        error: error.message,
      });
    }
  }
};

// @desc    Update result with validation
// @route   PUT /api/results/:id
// @access  Public
export const updateResult = async (req, res) => {
  try {
    const { 
      marks, 
      maxMarks, 
      examType, 
      academicYear 
    } = req.body;

    // Find the existing result
    const existingResult = await Result.findById(req.params.id);
    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Validate marks if provided
    if (marks !== undefined || maxMarks !== undefined) {
      const newMarks = marks !== undefined ? parseFloat(marks) : existingResult.marks;
      const newMaxMarks = maxMarks !== undefined ? parseFloat(maxMarks) : existingResult.maxMarks;
      
      const marksError = validateMarks(newMarks, newMaxMarks);
      if (marksError) {
        return res.status(400).json({
          success: false,
          message: marksError,
        });
      }
    }

    // Build update object (only allow certain fields to be updated)
    const updateData = {};
    if (marks !== undefined) updateData.marks = parseFloat(marks);
    if (maxMarks !== undefined) updateData.maxMarks = parseFloat(maxMarks);
    if (examType) updateData.examType = examType;
    if (academicYear) updateData.academicYear = academicYear;

    // Check for duplicate if examType or academicYear is being changed
    if (examType || academicYear) {
      const newExamType = examType || existingResult.examType;
      const newAcademicYear = academicYear || existingResult.academicYear;
      
      const duplicateResult = await Result.findOne({
        _id: { $ne: req.params.id }, // Exclude current result
        studentId: existingResult.studentId,
        subjectId: existingResult.subjectId,
        examType: newExamType,
        academicYear: newAcademicYear,
      });

      if (duplicateResult) {
        return res.status(409).json({
          success: false,
          message: `Result for this combination already exists`,
        });
      }
    }

    const result = await Result.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('studentId', 'name rollId fatherName')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    res.status(200).json({
      success: true,
      message: "Result updated successfully",
      data: result,
    });
  } catch (error) {
    console.error('Update Result Error:', error);
    
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "Result for this combination already exists",
      });
    } else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update result",
        error: error.message,
      });
    }
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Public
export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    await Result.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get results by student
// @route   GET /api/results/student/:studentId
// @access  Public
export const getResultsByStudent = async (req, res) => {
  try {
    const { academicYear, examType } = req.query;
    const filter = { studentId: req.params.studentId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

    const results = await Result.find(filter)
      .populate('studentId', 'name rollId')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get results by class
// @route   GET /api/results/class/:classId
// @access  Public
export const getResultsByClass = async (req, res) => {
  try {
    const { academicYear, examType, subjectId } = req.query;
    const filter = { classId: req.params.classId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;
    if (subjectId) filter.subjectId = subjectId;

    const results = await Result.find(filter)
      .populate('studentId', 'name rollId')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort({ 'studentId.rollId': 1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get results by subject
// @route   GET /api/results/subject/:subjectId
// @access  Public
export const getResultsBySubject = async (req, res) => {
  try {
    const { academicYear, examType, classId } = req.query;
    const filter = { subjectId: req.params.subjectId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;
    if (classId) filter.classId = classId;

    const results = await Result.find(filter)
      .populate('studentId', 'name rollId')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort({ marks: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get result statistics with enhanced analytics
// @route   GET /api/results/stats
// @access  Public
export const getResultStats = async (req, res) => {
  try {
    const { academicYear, classId, subjectId, examType } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (examType) filter.examType = examType;

    const totalResults = await Result.countDocuments(filter);
    
    if (totalResults === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalResults: 0,
          message: "No results found for the specified criteria"
        },
      });
    }

    // Grade distribution
    const gradeDistribution = await Result.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
          percentage: { $multiply: [{ $divide: [{ $sum: 1 }, totalResults] }, 100] }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Overall statistics
    const overallStats = await Result.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: "$percentage" },
          maxPercentage: { $max: "$percentage" },
          minPercentage: { $min: "$percentage" },
          passCount: {
            $sum: {
              $cond: [{ $gte: ["$percentage", 40] }, 1, 0]
            }
          },
          excellentCount: {
            $sum: {
              $cond: [{ $gte: ["$percentage", 90] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Average marks by subject
    const avgBySubject = await Result.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $group: {
          _id: {
            subjectId: "$subjectId",
            subjectName: "$subject.name",
            subjectCode: "$subject.code"
          },
          avgMarks: { $avg: "$marks" },
          avgPercentage: { $avg: "$percentage" },
          maxMarks: { $max: "$marks" },
          minMarks: { $min: "$marks" },
          count: { $sum: 1 },
          passCount: {
            $sum: {
              $cond: [{ $gte: ["$percentage", 40] }, 1, 0]
            }
          }
        }
      },
      { 
        $addFields: {
          passRate: { $multiply: [{ $divide: ["$passCount", "$count"] }, 100] }
        }
      },
      { $sort: { "_id.subjectName": 1 } }
    ]);

    // Top performers
    const topPerformers = await Result.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $group: {
          _id: {
            studentId: "$studentId",
            studentName: "$student.name",
            rollId: "$student.rollId"
          },
          avgPercentage: { $avg: "$percentage" },
          totalMarks: { $sum: "$marks" },
          totalMaxMarks: { $sum: "$maxMarks" },
          subjectCount: { $sum: 1 },
          grades: { $push: "$grade" }
        }
      },
      { 
        $addFields: {
          overallPercentage: { $multiply: [{ $divide: ["$totalMarks", "$totalMaxMarks"] }, 100] }
        }
      },
      { $sort: { avgPercentage: -1 } },
      { $limit: 10 }
    ]);

    // Class-wise performance (if not filtering by class)
    let classPerformance = [];
    if (!classId) {
      classPerformance = await Result.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "classes",
            localField: "classId",
            foreignField: "_id",
            as: "class"
          }
        },
        { $unwind: "$class" },
        {
          $group: {
            _id: {
              classId: "$classId",
              className: "$class.name",
              section: "$class.section"
            },
            avgPercentage: { $avg: "$percentage" },
            studentCount: { $addToSet: "$studentId" },
            totalResults: { $sum: 1 },
            passCount: {
              $sum: {
                $cond: [{ $gte: ["$percentage", 40] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            studentCount: { $size: "$studentCount" },
            passRate: { $multiply: [{ $divide: ["$passCount", "$totalResults"] }, 100] }
          }
        },
        { $sort: { avgPercentage: -1 } }
      ]);
    }

    const stats = overallStats[0] || {};
    const passRate = totalResults > 0 ? (stats.passCount / totalResults) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalResults,
        overallStats: {
          avgPercentage: stats.avgPercentage?.toFixed(2) || 0,
          maxPercentage: stats.maxPercentage?.toFixed(2) || 0,
          minPercentage: stats.minPercentage?.toFixed(2) || 0,
          passRate: passRate.toFixed(2),
          passCount: stats.passCount || 0,
          failCount: totalResults - (stats.passCount || 0),
          excellentCount: stats.excellentCount || 0
        },
        gradeDistribution,
        avgBySubject,
        topPerformers,
        classPerformance,
      },
    });
  } catch (error) {
    console.error('Get Result Stats Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch result statistics",
      error: error.message,
    });
  }
};

// @desc    Bulk create results
// @route   POST /api/results/bulk
// @access  Public
export const bulkCreateResults = async (req, res) => {
  try {
    const { results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Results array is required and must not be empty",
      });
    }

    const createdResults = [];
    const errors = [];

    for (let i = 0; i < results.length; i++) {
      try {
        const resultData = results[i];
        
        // Validate required fields
        if (!resultData.studentId || !resultData.subjectId || resultData.marks === undefined) {
          errors.push({
            index: i,
            error: "Missing required fields: studentId, subjectId, marks"
          });
          continue;
        }

        // Create the result
        const result = await Result.create(resultData);
        const populatedResult = await Result.findById(result._id)
          .populate('studentId', 'name rollId')
          .populate('classId', 'name section')
          .populate('subjectId', 'name code');
        
        createdResults.push(populatedResult);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk operation completed. ${createdResults.length} results created, ${errors.length} errors.`,
      data: {
        created: createdResults,
        errors: errors,
        summary: {
          total: results.length,
          successful: createdResults.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Bulk Create Results Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk results",
      error: error.message,
    });
  }
};

// @desc    Get results summary for a student
// @route   GET /api/results/student/:studentId/summary
// @access  Public
export const getStudentResultSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, examType } = req.query;

    const filter = { studentId };
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

    // Get student info
    const student = await Student.findById(studentId).populate('classId', 'name section');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all results for the student
    const results = await Result.find(filter)
      .populate('subjectId', 'name code')
      .sort({ 'subjectId.name': 1 });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          student: {
            name: student.name,
            rollId: student.rollId,
            class: `${student.classId.name} - ${student.classId.section}`
          },
          results: [],
          summary: {
            totalSubjects: 0,
            totalMarks: 0,
            totalMaxMarks: 0,
            overallPercentage: 0,
            overallGrade: 'N/A',
            passedSubjects: 0,
            failedSubjects: 0
          }
        }
      });
    }

    // Calculate summary
    const totalMarks = results.reduce((sum, result) => sum + result.marks, 0);
    const totalMaxMarks = results.reduce((sum, result) => sum + result.maxMarks, 0);
    const overallPercentage = (totalMarks / totalMaxMarks) * 100;
    const overallGrade = calculateGrade(overallPercentage);
    const passedSubjects = results.filter(result => result.percentage >= 40).length;
    const failedSubjects = results.length - passedSubjects;

    res.status(200).json({
      success: true,
      data: {
        student: {
          name: student.name,
          rollId: student.rollId,
          class: `${student.classId.name} - ${student.classId.section}`,
          fatherName: student.fatherName
        },
        results: results.map(result => ({
          subject: {
            name: result.subjectId.name,
            code: result.subjectId.code
          },
          marks: result.marks,
          maxMarks: result.maxMarks,
          percentage: result.percentage,
          grade: result.grade,
          examType: result.examType,
          academicYear: result.academicYear
        })),
        summary: {
          totalSubjects: results.length,
          totalMarks,
          totalMaxMarks,
          overallPercentage: Math.round(overallPercentage * 100) / 100,
          overallGrade,
          passedSubjects,
          failedSubjects,
          status: failedSubjects === 0 ? 'PASS' : 'FAIL'
        }
      }
    });
  } catch (error) {
    console.error('Get Student Result Summary Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student result summary",
      error: error.message,
    });
  }
};