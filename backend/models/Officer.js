import mongoose from 'mongoose';

const OfficerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  online: { type: Boolean, default: true },
  assignedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Officer', OfficerSchema);

