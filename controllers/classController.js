import Class from "../models/Class.js";

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
export const getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Public
export const createClass = async (req, res) => {
  try {
    const { name, section } = req.body;

    // Check if class with same name and section already exists
    const existingClass = await Class.findOne({ name, section });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Class with this name and section already exists",
      });
    }

    const classItem = await Class.create({
      name,
      section,
    });

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: classItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Class with this name and section already exists",
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

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Public
export const updateClass = async (req, res) => {
  try {
    const { name, section } = req.body;

    // Check if another class with same name and section exists (excluding current class)
    const existingClass = await Class.findOne({ 
      name, 
      section, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Another class with this name and section already exists",
      });
    }

    const classItem = await Class.findByIdAndUpdate(
      req.params.id,
      { name, section },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: classItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Class with this name and section already exists",
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

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Public
export const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};