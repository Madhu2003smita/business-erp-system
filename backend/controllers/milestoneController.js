const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const { sendSuccess, sendError } = require('../utils/response');

// POST: Add a milestone to a project
const addMilestone = async (req, res) => {
  try {
    console.log('PARAMS RECEIVED:', req.params); // This will now show { projectId: '...' }
    
    // CHANGE: Use projectId to match the route definition
    const { projectId } = req.params; 
    const { name, dueDate } = req.body;
    const tenantId = req.user.tenantId;

    // Validate using the matching variable
    if (!projectId) return sendError(res, 'Missing Project ID from URL', 400);
    if (!name) return sendError(res, 'Missing Milestone Name from body', 400);
    if (!dueDate) return sendError(res, 'Missing Due Date from body', 400);

    const project = await Project.findOne({ _id: projectId, tenantId });
    if (!project) return sendError(res, 'Project not found', 404);

    const milestone = new Milestone({
      project: projectId,
      name,
      dueDate,
      tenantId,
    });

    await milestone.save();
    await milestone.populate('project');

    return sendSuccess(res, 'Milestone created successfully', milestone, 201);
  } catch (error) {
    console.error('Error adding milestone:', error);
    return sendError(res, error.message, 500);
  }
};

// GET: List all milestones for a specific project
const getMilestones = async (req, res) => {
  try {
    // CHANGE: Use projectId here as well
    const { projectId } = req.params;
    const tenantId = req.user.tenantId;

    if (!projectId) return sendError(res, 'Missing project ID', 400);

    const project = await Project.findOne({ _id: projectId, tenantId });
    if (!project) return sendError(res, 'Project not found', 404);

    const milestones = await Milestone.find({ project: projectId, tenantId }).populate('project');
    return sendSuccess(res, 'Milestones retrieved successfully', milestones, 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH: Mark a milestone as complete
const completeMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const tenantId = req.user.tenantId;

    if (!milestoneId) {
      return sendError(res, 'Missing required parameter: milestoneId', 400);
    }

    // Find milestone and verify it belongs to this tenant
    const milestone = await Milestone.findOne({ _id: milestoneId, tenantId });
    if (!milestone) {
      return sendError(res, 'Milestone not found', 404);
    }

    // Check if already completed
    if (milestone.status === 'completed') {
      return sendError(res, 'Milestone already completed', 400);
    }

    // Update milestone
    milestone.status = 'completed';
    milestone.completedAt = new Date();
    await milestone.save();
    await milestone.populate('project');

    return sendSuccess(res, 'Milestone marked as completed', milestone, 200);
  } catch (error) {
    console.error('Error completing milestone:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  addMilestone,
  getMilestones,
  completeMilestone,
};
