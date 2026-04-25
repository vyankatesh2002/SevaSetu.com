import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'NEW' },
  severity: { type: String, default: 'medium' },
  officer: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Complaint', ComplaintSchema);
