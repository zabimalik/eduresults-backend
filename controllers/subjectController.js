import Subject from "../models/Subject.js";

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Public
export const createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check if subject with same name already exists
    const existingSubjectByName = await Subject.findOne({ name });
    if (existingSubjectByName) {
      return res.status(400).json({
        success: false,
        message: "Subject with this name already exists",
      });
    }

    // Check if subject with same code already exists
    const existingSubjectByCode = await Subject.findOne({ code: code.toUpperCase() });
    if (existingSubjectByCode) {
      return res.status(400).json({
        success: false,
        message: "Subject with this code already exists",
      });
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Subject with this code already exists",
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

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Public
export const updateSubject = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check if another subject with same code exists (excluding current subject)
    const existingSubject = await Subject.findOne({
      code: code.toUpperCase(),
      _id: { $ne: req.params.id }
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Another subject with this code already exists",
      });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, code: code.toUpperCase() },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Subject with this code already exists",
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

// @desc    Delete subject with cascading delete
// @route   DELETE /api/subjects/:id
// @access  Public
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Store subject code for cascading delete
    const subjectCode = subject.code;
    const subjectName = subject.name;

    console.log(`🗑️ Deleting subject: ${subjectName} (${subjectCode})`);

    // Import models for cascading delete
    const Combination = (await import("../models/Combination.js")).default;
    const Result = (await import("../models/Result.js")).default;

    // Count related records before deletion
    const combinationsCount = await Combination.countDocuments({ subjectCode });
    const resultsCount = await Result.countDocuments({ subjectCode });

    console.log(`📊 Found ${combinationsCount} combinations and ${resultsCount} results to delete`);

    // Delete all combinations with this subject code
    const deletedCombinations = await Combination.deleteMany({ subjectCode });
    console.log(`✅ Deleted ${deletedCombinations.deletedCount} combinations`);

    // Delete all results with this subject code
    const deletedResults = await Result.deleteMany({ subjectCode });
    console.log(`✅ Deleted ${deletedResults.deletedCount} results`);

    // Finally, delete the subject itself
    await Subject.findByIdAndDelete(req.params.id);
    console.log(`✅ Deleted subject: ${subjectName}`);

    res.status(200).json({
      success: true,
      message: `Subject "${subjectName}" deleted successfully`,
      deletedRecords: {
        subject: 1,
        combinations: deletedCombinations.deletedCount,
        results: deletedResults.deletedCount,
        total: 1 + deletedCombinations.deletedCount + deletedResults.deletedCount
      }
    });
  } catch (error) {
    console.error('❌ Delete Subject Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error.message,
    });
  }
};