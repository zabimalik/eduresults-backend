import Result from "../models/Result.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";

// @desc    Get all results
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
      search 
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

// @desc    Create new result
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

    // Validate that student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate that class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "Class not found",
      });
    }

    // Validate that subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Validate marks
    if (marks > maxMarks) {
      return res.status(400).json({
        success: false,
        message: "Marks cannot be greater than maximum marks",
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
      return res.status(400).json({
        success: false,
        message: `Result for this student in ${subject.name} (${examType}) already exists for academic year ${finalAcademicYear}`,
      });
    }

    const result = await Result.create({
      studentId,
      rollId: rollId.toUpperCase(),
      classId,
      subjectId,
      marks,
      maxMarks,
      examType,
      academicYear: finalAcademicYear,
    });

    // Populate the created result
    const populatedResult = await Result.findById(result._id)
      .populate('studentId', 'name rollId')
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    res.status(201).json({
      success: true,
      message: "Result added successfully",
      data: populatedResult,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Result for this combination already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  }
};

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Public
export const updateResult = async (req, res) => {
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

    // Validate marks if provided
    if (marks !== undefined && maxMarks !== undefined && marks > maxMarks) {
      return res.status(400).json({
        success: false,
        message: "Marks cannot be greater than maximum marks",
      });
    }

    // If studentId is being updated, validate it exists
    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(400).json({
          success: false,
          message: "Student not found",
        });
      }
    }

    // If classId is being updated, validate it exists
    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: "Class not found",
        });
      }
    }

    // If subjectId is being updated, validate it exists
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: "Subject not found",
        });
      }
    }

    const updateData = {
      ...(studentId && { studentId }),
      ...(rollId && { rollId: rollId.toUpperCase() }),
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(marks !== undefined && { marks }),
      ...(maxMarks !== undefined && { maxMarks }),
      ...(examType && { examType }),
      ...(academicYear && { academicYear }),
    };

    const result = await Result.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('studentId', 'name rollId')
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
      message: "Result updated successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Result for this combination already exists",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server Error",
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

// @desc    Get result statistics
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
    
    // Grade distribution
    const gradeDistribution = await Result.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
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
            subjectName: "$subject.name"
          },
          avgMarks: { $avg: "$marks" },
          avgPercentage: { $avg: "$percentage" },
          count: { $sum: 1 }
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
          count: { $sum: 1 }
        }
      },
      { $sort: { avgPercentage: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalResults,
        gradeDistribution,
        avgBySubject,
        topPerformers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};