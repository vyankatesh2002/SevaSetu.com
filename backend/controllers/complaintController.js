import Complaint from '../models/Complaint.js';
import Officer from '../models/Officer.js';
import { analyzeComplaint, assignOfficer, checkEscalation } from '../services/aiEngine.js';

// GET all complaints
export const getComplaints = async (req, res) => {
  try {
    let data = await Complaint.find().sort({ createdAt: -1 });

    // Check escalations
    data = data.map(c => {
      const escalation = checkEscalation(c);
      if (escalation.escalated && c.status !== 'ESCALATED') {
        return { ...c.toObject(), status: 'ESCALATED', escalationReason: escalation.reason };
      }
      return c;
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE complaint — with AI analysis + smart officer assignment
export const createComplaint = async (req, res) => {
  try {
    // Step 1: AI analyzes severity & priority
    const ai = analyzeComplaint(req.body);

    // Step 2: Fetch available officers from DB
    let officers = await Officer.find();

    // Seed default officers if none exist
    if (officers.length === 0) {
      const defaults = [
        { id: 'O1', name: 'Officer Sharma', online: true, assignedCount: 0 },
        { id: 'O2', name: 'Officer Patil', online: true, assignedCount: 0 },
        { id: 'O3', name: 'Officer Gupta', online: false, assignedCount: 0 }
      ];
      await Officer.insertMany(defaults);
      officers = await Officer.find();
    }

    // Step 3: Smart assign least-loaded officer
    const officerId = assignOfficer(officers);

    // Step 4: Update officer load if assigned
    if (officerId) {
      await Officer.findOneAndUpdate(
        { id: officerId },
        { $inc: { assignedCount: 1 } }
      );
    }

    // Step 5: Build complaint with AI decisions
    const complaintData = {
      ...req.body,
      severity: ai.severity,
      priorityScore: ai.priorityScore,
      tags: ai.tags,
      officer: officerId,
      status: officerId ? 'ASSIGNED' : 'NEW'
    };

    const newComplaint = new Complaint(complaintData);
    await newComplaint.save();

    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE complaint
export const updateComplaint = async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE complaint
export const deleteComplaint = async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
