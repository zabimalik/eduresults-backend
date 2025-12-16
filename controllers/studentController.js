import Student from "../models/Student.js";
import Class from "../models/Class.js";

// @desc    Get all students
// @route   GET /api/students
// @access  Public
export const getStudents = async (req, res) => {
  try {
    const { classId, academicYear, isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollId: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('classId', 'name section')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classId', 'name section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Public
export const createStudent = async (req, res) => {
  try {
    const { rollId, name, fatherName, classId, phone, address, academicYear } = req.body;

    // Validate that class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if student with same roll ID already exists
    const existingStudent = await Student.findOne({ rollId: rollId.toUpperCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this Roll ID already exists",
      });
    }

    // Generate academic year if not provided
    let finalAcademicYear = academicYear;
    if (!finalAcademicYear) {
      const currentYear = new Date().getFullYear();
      finalAcademicYear = `${currentYear}-${currentYear + 1}`;
    }

    const student = await Student.create({
      rollId: rollId.toUpperCase(),
      name,
      fatherName,
      classId,
      phone,
      address,
      academicYear: finalAcademicYear,
    });

    // Populate the created student
    const populatedStudent = await Student.findById(student._id)
      .populate('classId', 'name section');

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: populatedStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Student with this Roll ID already exists",
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

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
export const updateStudent = async (req, res) => {
  try {
    const { rollId, name, fatherName, classId, phone, address, academicYear, isActive } = req.body;

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

    // If rollId is being updated, check for duplicates
    if (rollId) {
      const existingStudent = await Student.findOne({ 
        rollId: rollId.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Another student with this Roll ID already exists",
        });
      }
    }

    const updateData = {
      ...(rollId && { rollId: rollId.toUpperCase() }),
      ...(name && { name }),
      ...(fatherName && { fatherName }),
      ...(classId && { classId }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(academicYear && { academicYear }),
      ...(isActive !== undefined && { isActive }),
    };

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('classId', 'name section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Student with this Roll ID already exists",
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

// @desc    Toggle student status
// @route   PATCH /api/students/:id/toggle
// @access  Public
export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.isActive = !student.isActive;
    await student.save();

    // Populate the updated student
    const populatedStudent = await Student.findById(student._id)
      .populate('classId', 'name section');

    res.status(200).json({
      success: true,
      message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`,
      data: populatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Public
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get students by class
// @route   GET /api/students/class/:classId
// @access  Public
export const getStudentsByClass = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = { classId: req.params.classId };
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }

    const students = await Student.find(filter)
      .populate('classId', 'name section')
      .sort({ rollId: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get students by academic year
// @route   GET /api/students/year/:academicYear
// @access  Public
export const getStudentsByYear = async (req, res) => {
  try {
    const students = await Student.find({ academicYear: req.params.academicYear })
      .populate('classId', 'name section')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Public
export const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const inactiveStudents = await Student.countDocuments({ isActive: false });
    
    // Get students by academic year
    const studentsByYear = await Student.aggregate([
      {
        $group: {
          _id: "$academicYear",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Get students by class
    const studentsByClass = await Student.aggregate([
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
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.className": 1, "_id.section": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        studentsByYear,
        studentsByClass,
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