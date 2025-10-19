import { Router } from 'express';
import { pool } from '../database/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { DeliveryStats } from '../types';

const router = Router();

// Get delivery stats (admin and delivery staff only)
router.get('/delivery', authenticateToken, requireRole(['admin', 'delivery_staff']), async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as totalPackages,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as inTransit,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM packages
    `);

    const stats = rows as any[];
    const result: DeliveryStats = {
      totalPackages: stats[0].totalPackages,
      delivered: stats[0].delivered,
      inTransit: stats[0].inTransit,
      pending: stats[0].pending,
      failed: stats[0].failed
    };

    res.json(result);
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer stats
router.get('/customer/:customerId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { customerId } = req.params;

    // Check if user has access to this customer's stats
    if (req.user!.role === 'customer' && req.user!.id !== customerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as totalPackages,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as inTransit,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM packages
      WHERE customer_id = ?
    `, [customerId]);

    const stats = rows as any[];
    const result: DeliveryStats = {
      totalPackages: stats[0].totalPackages,
      delivered: stats[0].delivered,
      inTransit: stats[0].inTransit,
      pending: stats[0].pending,
      failed: stats[0].failed
    };

    res.json(result);
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
