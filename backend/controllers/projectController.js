const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const { sendSuccess, sendError } = require('../utils/response');

// POST: Create a project
const createProject = async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !budget || !startDate || !endDate) {
      return sendError(res, 'Missing fields', 400);
    }

    // Validate endDate is not before startDate
    if (new Date(endDate) < new Date(startDate)) {
      return sendError(res, 'End date cannot be before start date', 400);
    }

    // Create project (projectNumber will be auto-generated in pre-save hook)
    const project = new Project({
      name,
      description,
      budget,
      startDate,
      endDate,
      tenantId,
      createdBy: userId,
    });

    await project.save();

    return sendSuccess(res, 'Project created successfully', project, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return sendError(res, error.message, 500);
  }
};

// GET: List all projects (excluding soft-deleted) with optional status filter
const getProjects = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status } = req.query;

    // Base query: filter by tenantId and exclude soft-deleted
    let query = { tenantId, deletedAt: null };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    return sendSuccess(res, 'Projects retrieved successfully', projects, 200);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return sendError(res, error.message, 500);
  }
};

// GET: Fetch project details with associated milestones
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    if (!id) {
      return sendError(res, 'Missing required parameter: id', 400);
    }

    // Find project and exclude soft-deleted
    const project = await Project.findOne({
      _id: id,
      tenantId,
      deletedAt: null,
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Fetch associated milestones
    const milestones = await Milestone.find({
      project: id,
      tenantId,
    });

    // Return project with milestones embedded
    const projectData = project.toObject();
    projectData.milestones = milestones;

    return sendSuccess(res, 'Project retrieved successfully', projectData, 200);
  } catch (error) {
    console.error('Error fetching project:', error);
    return sendError(res, error.message, 500);
  }
};

// PUT: Update a project with budget overrun check
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, budget, actualCost, startDate, endDate, status } = req.body;
    const tenantId = req.user.tenantId;

    if (!id) {
      return sendError(res, 'Missing required parameter: id', 400);
    }

    // Find project
    const project = await Project.findOne({
      _id: id,
      tenantId,
      deletedAt: null,
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // If endDate is being updated, validate it
    const finalEndDate = endDate || project.endDate;
    const finalStartDate = startDate || project.startDate;
    if (new Date(finalEndDate) < new Date(finalStartDate)) {
      return sendError(res, 'End date cannot be before start date', 400);
    }

    // Update fields
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (budget !== undefined) project.budget = budget;
    if (actualCost !== undefined) project.actualCost = actualCost;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (status !== undefined) project.status = status;

    await project.save();
    
    // The Math: 10% over budget means actualCost > budget * 1.10
    const isOverrun = project.actualCost > (project.budget * 1.10);

    // Return the response directly so the test script can easily find 'overrunAlert'
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
      overrunAlert: isOverrun 
    });
    
  } catch (error) {
    console.error('Error updating project:', error);
    return sendError(res, error.message, 500);
  }
};

// DELETE: Soft delete a project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    if (!id) {
      return sendError(res, 'Missing required parameter: id', 400);
    }

    // Find project
    const project = await Project.findOne({
      _id: id,
      tenantId,
      deletedAt: null,
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Soft delete by setting deletedAt
    project.deletedAt = new Date();
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: project
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return sendError(res, error.message, 500);
  }
};
module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
