import Notice from "../models/Notice.js";

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
export const getNotices = async (req, res) => {
  try {
    const { 
      isActive, 
      priority, 
      targetAudience, 
      includeExpired, 
      search,
      limit,
      page 
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (priority) filter.priority = priority;
    if (targetAudience) filter.targetAudience = targetAudience;
    
    // Exclude expired notices by default unless specifically requested
    if (includeExpired !== 'true') {
      filter.$or = [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ];
    }
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Notice.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: notices.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Public
export const getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Public
export const createNotice = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      isActive, 
      priority, 
      expiryDate, 
      targetAudience, 
      createdBy 
    } = req.body;

    // Validate expiry date if provided
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future",
      });
    }

    const notice = await Notice.create({
      title,
      content,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || "medium",
      expiryDate: expiryDate || null,
      targetAudience: targetAudience || "all",
      createdBy: createdBy || "Admin",
    });

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: notice,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: messages.join(', '),
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

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Public
export const updateNotice = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      isActive, 
      priority, 
      expiryDate, 
      targetAudience 
    } = req.body;

    // Validate expiry date if provided
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = priority;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;

    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: notice,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: messages.join(', '),
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

// @desc    Toggle notice status
// @route   PATCH /api/notices/:id/toggle
// @access  Public
export const toggleNoticeStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    res.status(200).json({
      success: true,
      message: `Notice ${notice.isActive ? 'activated' : 'deactivated'} successfully`,
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Public
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get active notices
// @route   GET /api/notices/active
// @access  Public
export const getActiveNotices = async (req, res) => {
  try {
    const { targetAudience, priority } = req.query;
    
    const filter = { 
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    };
    
    if (targetAudience) filter.targetAudience = targetAudience;
    if (priority) filter.priority = priority;

    const notices = await Notice.find(filter)
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get notices by priority
// @route   GET /api/notices/priority/:priority
// @access  Public
export const getNoticesByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const { isActive, targetAudience } = req.query;
    
    const filter = { priority };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (targetAudience) filter.targetAudience = targetAudience;

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get notice statistics
// @route   GET /api/notices/stats
// @access  Public
export const getNoticeStats = async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ isActive: true });
    const expiredNotices = await Notice.countDocuments({
      expiryDate: { $lte: new Date() }
    });
    
    // Get notices by priority
    const noticesByPriority = await Notice.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get notices by target audience
    const noticesByAudience = await Notice.aggregate([
      {
        $group: {
          _id: "$targetAudience",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent notices (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentNotices = await Notice.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalNotices,
        activeNotices,
        expiredNotices,
        recentNotices,
        noticesByPriority,
        noticesByAudience,
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