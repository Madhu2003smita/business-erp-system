const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

exports.createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentDate, method, reference } = req.body;

    if (!invoiceId || amount === undefined || !method) {
      return res.status(400).json({ message: 'Missing required fields: invoiceId, amount, or method' });
    }

    // Assume auth middleware sets req.user.tenantId
    const tenantId = req.user.tenantId;

    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    if (paymentDate) {
      const pDate = new Date(paymentDate);
      if (pDate < invoice.createdAt) {
        return res.status(400).json({ message: 'Payment date cannot be before invoice date' });
      }
    }

    const existingPayments = await Payment.find({ invoiceId });
    const existingSum = existingPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalAmount = amount + existingSum;

    if (totalAmount > invoice.amount) {
      return res.status(400).json({ message: 'Payment exceeds outstanding balance' });
    }

    const payment = new Payment({
      tenantId,
      invoiceId,
      amount,
      paymentDate: paymentDate || Date.now(),
      method,
      reference
    });

    const savedPayment = await payment.save();

    if (totalAmount === invoice.amount) {
      invoice.status = 'paid';
      await invoice.save();
    }

    return res.status(201).json(savedPayment);

  } catch (error) {
    console.error('Create Payment Error:', error);
    return res.status(500).json({ message: 'Server error recording payment', error: error.message });
  }
};
