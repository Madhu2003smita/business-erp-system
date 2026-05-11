const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    budget: {
      type: Number,
      required: true,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on_hold'],
      default: 'active',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on tenantId and projectNumber
projectSchema.index({ tenantId: 1, projectNumber: 1 }, { unique: true });

// Pre-validate hook to auto-generate projectNumber sequentially per tenantId
projectSchema.pre('validate', async function () {
  if (!this.isNew) {
    return;
  }

  try {
    // Find the latest project for this tenant and extract the number
    const lastProject = await mongoose
      .model('Project')
      .findOne({ tenantId: this.tenantId })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;
    if (lastProject && lastProject.projectNumber) {
      // Extract the number part from projectNumber (e.g., "PRJ-00001" -> 1)
      const match = lastProject.projectNumber.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    // Format as PRJ-XXXXX (5 digits)
    this.projectNumber = `PRJ-${String(nextNumber).padStart(5, '0')}`;
    return;
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Project', projectSchema);
