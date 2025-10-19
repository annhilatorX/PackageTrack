import { Router } from 'express';
import { pool } from '../database/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { User, DatabaseUser } from '../types';

const router = Router();

// Helper function to convert database user to API user
const convertToUser = (dbUser: DatabaseUser): User => ({
  id: dbUser.id,
  email: dbUser.email,
  name: dbUser.name,
  role: dbUser.role,
  phone: dbUser.phone,
  createdAt: dbUser.created_at
});

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, email, name, role, phone, created_at FROM users';
    const params: any[] = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    const users = (rows as DatabaseUser[]).map(convertToUser);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [rows] = await pool.execute(
      'SELECT id, email, name, role, phone, created_at FROM users WHERE id = ?',
      [id]
    );

    const users = rows as DatabaseUser[];
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(convertToUser(users[0]));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user exists
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    await pool.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, id]
    );

    // Fetch updated user
    const [updatedRows] = await pool.execute(
      'SELECT id, email, name, role, phone, created_at FROM users WHERE id = ?',
      [id]
    );

    const updatedUsers = updatedRows as DatabaseUser[];
    res.json(convertToUser(updatedUsers[0]));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user!.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
