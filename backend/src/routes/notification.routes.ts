import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import Notification from '../models/Notification';

const router = Router();

// Get all notifications for current user
router.get('/', protect, async (req: any, res: any) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    read: false,
  });
  res.json({ success: true, notifications, unreadCount });
});

// Mark all as read
router.patch('/mark-all-read', protect, async (req: any, res: any) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true }
  );
  res.json({ success: true });
});

// Mark one as read
router.patch('/:id/read', protect, async (req: any, res: any) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

export default router;