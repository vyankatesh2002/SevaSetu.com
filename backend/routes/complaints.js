import express from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint
} from '../controllers/complaintController.js';
import auth, { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Wrap controller to inject io for real-time emits
function emitAfter(fn, eventName) {
  return async (req, res) => {
    // Override res.json to capture output
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const io = req.app.get('io');
      if (io) io.emit(eventName, data);
      return originalJson(data);
    };
    await fn(req, res);
  };
}

router.get('/', auth, getComplaints);
router.post('/', auth, emitAfter(createComplaint, 'complaintCreated'));
router.put('/:id', auth, emitAfter(updateComplaint, 'complaintUpdated'));
router.delete('/:id', auth, isAdmin, emitAfter(deleteComplaint, 'complaintDeleted'));

export default router;

