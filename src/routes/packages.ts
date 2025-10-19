import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { validatePackage, validatePackageStatusUpdate } from '../middleware/validation';
import { Package, PackageHistory, DatabasePackage, DatabasePackageHistory } from '../types';

const router = Router();

// Helper function to convert database package to API package
const convertToPackage = (dbPackage: DatabasePackage): Package => ({
  id: dbPackage.id,
  trackingNumber: dbPackage.tracking_number,
  senderName: dbPackage.sender_name,
  senderAddress: dbPackage.sender_address,
  receiverName: dbPackage.receiver_name,
  receiverAddress: dbPackage.receiver_address,
  receiverPhone: dbPackage.receiver_phone,
  status: dbPackage.status,
  currentLocation: dbPackage.current_location,
  estimatedDelivery: dbPackage.estimated_delivery,
  weight: dbPackage.weight,
  description: dbPackage.description,
  createdAt: dbPackage.created_at,
  updatedAt: dbPackage.updated_at,
  deliveryStaffId: dbPackage.delivery_staff_id,
  customerId: dbPackage.customer_id
});

// Helper function to convert database package history to API package history
const convertToPackageHistory = (dbHistory: DatabasePackageHistory): PackageHistory => ({
  id: dbHistory.id,
  packageId: dbHistory.package_id,
  status: dbHistory.status,
  location: dbHistory.location,
  notes: dbHistory.notes,
  timestamp: dbHistory.timestamp,
  updatedBy: dbHistory.updated_by
});

// Get all packages (with optional filters)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, customerId } = req.query;
    let query = 'SELECT * FROM packages';
    const params: any[] = [];

    if (req.user!.role === 'customer') {
      query += ' WHERE customer_id = ?';
      params.push(req.user!.id);
    } else if (req.user!.role === 'delivery_staff') {
      // Delivery staff sees only packages assigned to them
      query += ' WHERE delivery_staff_id = ?';
      params.push(req.user!.id);
    } else if (customerId) {
      query += ' WHERE customer_id = ?';
      params.push(customerId);
    }

    if (status) {
      query += req.user!.role === 'customer' || customerId ? ' AND status = ?' : ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    const packages = (rows as DatabasePackage[]).map(convertToPackage);

    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get package by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [id]
    );

    const packages = rows as DatabasePackage[];
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const pkg = packages[0];

    // Check if user has access to this package
    if (req.user!.role === 'customer' && pkg.customer_id !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(convertToPackage(pkg));
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Track package by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const [rows] = await pool.execute(
      'SELECT * FROM packages WHERE tracking_number = ?',
      [trackingNumber]
    );

    const packages = rows as DatabasePackage[];
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(convertToPackage(packages[0]));
  } catch (error) {
    console.error('Track package error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new package (admin only)
router.post('/', authenticateToken, requireRole(['admin']), validatePackage, async (req: AuthRequest, res) => {
  try {
    const packageData = req.body;
    const packageId = uuidv4();

    await pool.execute(
      `INSERT INTO packages (id, tracking_number, sender_name, sender_address, receiver_name, receiver_address, receiver_phone, status, current_location, estimated_delivery, weight, description, customer_id, delivery_staff_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageId,
        packageData.trackingNumber,
        packageData.senderName,
        packageData.senderAddress,
        packageData.receiverName,
        packageData.receiverAddress,
        packageData.receiverPhone,
        'pending',
        packageData.currentLocation || null,
        packageData.estimatedDelivery,
        packageData.weight,
        packageData.description || null,
        packageData.customerId || req.user!.id,
        packageData.deliveryStaffId || null
      ]
    );

    // Create initial package history entry
    const historyId = uuidv4();
    await pool.execute(
      'INSERT INTO package_history (id, package_id, status, location, notes, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [
        historyId,
        packageId,
        'pending',
        packageData.currentLocation || 'Warehouse',
        'Package created',
        req.user!.id
      ]
    );

    // Fetch the created package
    const [rows] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [packageId]
    );

    const packages = rows as DatabasePackage[];
    res.status(201).json(convertToPackage(packages[0]));
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update package status
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'delivery_staff']), validatePackageStatusUpdate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, location, notes } = req.body;

    // Check if package exists
    const [rows] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [id]
    );

    const packages = rows as DatabasePackage[];
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Update package
    await pool.execute(
      'UPDATE packages SET status = ?, current_location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, location || null, id]
    );

    // Add to package history
    const historyId = uuidv4();
    await pool.execute(
      'INSERT INTO package_history (id, package_id, status, location, notes, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [historyId, id, status, location || 'Unknown', notes || null, req.user!.id]
    );

    // Fetch updated package
    const [updatedRows] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [id]
    );

    const updatedPackages = updatedRows as DatabasePackage[];
    res.json(convertToPackage(updatedPackages[0]));
  } catch (error) {
    console.error('Update package status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete package
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id FROM packages WHERE id = ?',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await pool.execute('DELETE FROM packages WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get package history
router.get('/:id/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if package exists and user has access
    const [packageRows] = await pool.execute(
      'SELECT customer_id FROM packages WHERE id = ?',
      [id]
    );

    const packages = packageRows as any[];
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (req.user!.role === 'customer' && packages[0].customer_id !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [historyRows] = await pool.execute(
      'SELECT * FROM package_history WHERE package_id = ? ORDER BY timestamp ASC',
      [id]
    );

    const history = (historyRows as DatabasePackageHistory[]).map(convertToPackageHistory);
    res.json(history);
  } catch (error) {
    console.error('Get package history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
