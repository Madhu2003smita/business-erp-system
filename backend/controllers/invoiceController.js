const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');

const buildUniqueInvoiceNumber = async (tenantId, requestedInvoiceNumber) => {
  const baseNumber = String(requestedInvoiceNumber || `INV-${Date.now()}`).trim();
  let candidate = baseNumber;

  const tenantCollision = await Invoice.findOne({ tenantId, invoiceNumber: candidate });
  if (tenantCollision) {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    candidate = `${baseNumber}-${uniqueSuffix}`;
  }

  while (await Invoice.findOne({ invoiceNumber: candidate })) {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    candidate = `${baseNumber}-${uniqueSuffix}`;
  }

  return candidate;
};

exports.createInvoice = async (req, res) => {
  try {
    const { type, partyName, amount, currency, dueDate, lineItems } = req.body;
    const tenantId = req.user?.tenantId;

    if (!type || !partyName || amount === undefined || !dueDate || !lineItems) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (type !== 'AP' && type !== 'AR') {
      return res.status(400).json({ message: "Type must be 'AP' or 'AR'" });
    }

    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized tenant' });
    }

    req.body.tenantId = tenantId;

    const invoiceNumber = await buildUniqueInvoiceNumber(tenantId, req.body.invoiceNumber);

    const invoice = new Invoice({
      tenantId,
      invoiceNumber,
      type,
      partyName,
      amount,
      currency,
      dueDate,
      lineItems
    });

    const savedInvoice = await invoice.save();
    return res.status(201).json(savedInvoice);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized tenant' });
    }

    const invoices = await Invoice.find({ tenantId, isDeleted: false }).sort({ createdAt: -1 });
    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAgingReport = async (req, res) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.user.tenantId);

    const report = await Invoice.aggregate([
      {
        $match: {
          tenantId: tenantId,
          status: { $ne: 'paid' }
        }
      },
      {
        $addFields: {
          daysOverdue: {
            $max: [
              0,
              {
                $floor: {
                  $divide: [
                    { $subtract: ["$$NOW", "$dueDate"] },
                    1000 * 60 * 60 * 24
                  ]
                }
              }
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$daysOverdue",
          boundaries: [0, 1, 31, 61, 91],
          default: "90+ days",
          output: {
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        }
      }
    ]);

    const formattedReport = report.map(b => {
      let category = "";
      if (b._id === 0) category = "Current (0 days)";
      else if (b._id === 1) category = "1-30 days";
      else if (b._id === 31) category = "31-60 days";
      else if (b._id === 61) category = "61-90 days";
      else category = "90+ days";

      return {
        category,
        count: b.count,
        totalAmount: b.totalAmount
      };
    });

    return res.status(200).json(formattedReport);
  } catch (error) {
    console.error('Aging Report Error:', error);
    return res.status(500).json({ message: 'Server error generating aging report', error: error.message });
  }
};
