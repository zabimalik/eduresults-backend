import Combination from "../models/Combination.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";

// @desc    Get all combinations
// @route   GET /api/combinations
// @access  Public
export const getCombinations = async (req, res) => {
  try {
    const combinations = await Combination.find()
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: combinations.length,
      data: combinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single combination
// @route   GET /api/combinations/:id
// @access  Public
export const getCombination = async (req, res) => {
  try {
    const combination = await Combination.findById(req.params.id)
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: "Combination not found",
      });
    }

    res.status(200).json({
      success: true,
      data: combination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new combination
// @route   POST /api/combinations
// @access  Public
export const createCombination = async (req, res) => {
  try {
    const { classId, subjectId, isActive = true } = req.body;

    // Validate that class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "Class not found",
      });
    }

    // Validate that subject exists
    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(400).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check if combination already exists
    const existingCombination = await Combination.findOne({ classId, subjectId });
    if (existingCombination) {
      return res.status(400).json({
        success: false,
        message: "This class-subject combination already exists",
      });
    }

    const combination = await Combination.create({
      classId,
      subjectId,
      subjectCode: subjectExists.code,
      isActive,
    });

    // Populate the created combination
    const populatedCombination = await Combination.findById(combination._id)
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    res.status(201).json({
      success: true,
      message: "Combination created successfully",
      data: populatedCombination,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "This class-subject combination already exists",
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

// @desc    Create multiple combinations for a class
// @route   POST /api/combinations/bulk
// @access  Public
export const createBulkCombinations = async (req, res) => {
  try {
    const { classId, subjectIds, isActive = true } = req.body;

    // Validate input
    if (!classId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Class ID and at least one subject ID are required",
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

    // Validate that all subjects exist
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more subjects not found",
      });
    }

    // Check for existing combinations
    const existingCombinations = await Combination.find({
      classId,
      subjectId: { $in: subjectIds },
    });

    const existingSubjectIds = existingCombinations.map(c => c.subjectId.toString());
    const newSubjectIds = subjectIds.filter(id => !existingSubjectIds.includes(id.toString()));

    // Create new combinations
    const newCombinations = [];
    if (newSubjectIds.length > 0) {
      const combinationsToCreate = newSubjectIds.map(subjectId => {
        const subject = subjects.find(s => s._id.toString() === subjectId.toString());
        return {
          classId,
          subjectId,
          subjectCode: subject.code,
          isActive,
        };
      });

      const created = await Combination.insertMany(combinationsToCreate);

      // Populate the created combinations
      for (const combination of created) {
        const populated = await Combination.findById(combination._id)
          .populate('classId', 'name section')
          .populate('subjectId', 'name code');
        newCombinations.push(populated);
      }
    }

    res.status(201).json({
      success: true,
      message: `${newCombinations.length} combination(s) created successfully${existingCombinations.length > 0 ? `, ${existingCombinations.length} skipped (already exist)` : ''}`,
      data: {
        created: newCombinations,
        skipped: existingCombinations.length,
        total: subjectIds.length,
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

// @desc    Update combination
// @route   PUT /api/combinations/:id
// @access  Public
export const updateCombination = async (req, res) => {
  try {
    const { classId, subjectId, isActive } = req.body;

    // If classId or subjectId is being updated, validate they exist
    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: "Class not found",
        });
      }
    }

    if (subjectId) {
      const subjectExists = await Subject.findById(subjectId);
      if (!subjectExists) {
        return res.status(400).json({
          success: false,
          message: "Subject not found",
        });
      }
    }

    // If both classId and subjectId are provided, check for duplicates
    if (classId && subjectId) {
      const existingCombination = await Combination.findOne({
        classId,
        subjectId,
        _id: { $ne: req.params.id }
      });

      if (existingCombination) {
        return res.status(400).json({
          success: false,
          message: "Another combination with this class and subject already exists",
        });
      }
    }

    // Prepare update data
    const updateData = { isActive };
    if (classId) updateData.classId = classId;
    if (subjectId) {
      updateData.subjectId = subjectId;
      // Fetch the subject to get its code
      const subject = await Subject.findById(subjectId);
      updateData.subjectCode = subject.code;
    }

    const combination = await Combination.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('classId', 'name section')
      .populate('subjectId', 'name code');

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: "Combination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Combination updated successfully",
      data: combination,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "This class-subject combination already exists",
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

// @desc    Toggle combination status
// @route   PATCH /api/combinations/:id/toggle
// @access  Public
export const toggleCombination = async (req, res) => {
  try {
    const combination = await Combination.findById(req.params.id);

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: "Combination not found",
      });
    }

    combination.isActive = !combination.isActive;
    await combination.save();

    // Populate the updated combination
    const populatedCombination = await Combination.findById(combination._id)
      .populate('classId', 'name section')
      .populate('subjectId', 'name code');

    res.status(200).json({
      success: true,
      message: `Combination ${combination.isActive ? 'activated' : 'deactivated'} successfully`,
      data: populatedCombination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete combination
// @route   DELETE /api/combinations/:id
// @access  Public
export const deleteCombination = async (req, res) => {
  try {
    const combination = await Combination.findById(req.params.id);

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: "Combination not found",
      });
    }

    await Combination.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Combination deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get combinations by class
// @route   GET /api/combinations/class/:classId
// @access  Public
export const getCombinationsByClass = async (req, res) => {
  try {
    const combinations = await Combination.find({ classId: req.params.classId })
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: combinations.length,
      data: combinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get combinations by subject
// @route   GET /api/combinations/subject/:subjectId
// @access  Public
export const getCombinationsBySubject = async (req, res) => {
  try {
    const combinations = await Combination.find({ subjectId: req.params.subjectId })
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: combinations.length,
      data: combinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};