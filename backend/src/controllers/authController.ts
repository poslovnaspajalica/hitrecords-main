import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../utils/email';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const [existingUsers]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, firstName, lastName]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'customer' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours

    await pool.query(
      `UPDATE users 
       SET verification_token = ?,
           verification_token_expires_at = ?
       WHERE id = ?`,
      [verificationToken, tokenExpiresAt, userId]
    );

    // TODO: Send verification email (implementirat ćemo kasnije)
    // await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'customer'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Dohvati korisnika
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Provjeri lozinku
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Kreiraj token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Vrati podatke bez lozinke
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [users]: any = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Provjeri postoji li korisnik
    const [users]: any = await pool.query(
      'SELECT id FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = users[0].id;

    // Generiraj token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Spremi token u bazu
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 sat

    await pool.query(
      `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [tokenId, userId, tokenHash, expiresAt]
    );

    // Pošalji email
    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating password reset' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Hash token za usporedbu
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Pronađi važeći token
    const [tokens]: any = await pool.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userId = tokens[0].user_id;

    // Hash nova lozinka
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Ažuriraj lozinku
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    // Obriši iskorišteni token
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Change password (for logged in users)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const [users]: any = await pool.query(
      `SELECT * FROM users 
       WHERE verification_token = ? 
       AND verification_token_expires_at > NOW()
       AND email_verified = false`,
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user
    await pool.query(
      `UPDATE users 
       SET email_verified = true,
           verification_token = NULL,
           verification_token_expires_at = NULL
       WHERE id = ?`,
      [users[0].id]
    );

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email' });
  }
};

// Resend verification email
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE id = ? AND email_verified = false',
      [userId]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found or already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Update user with new token
    await pool.query(
      `UPDATE users 
       SET verification_token = ?,
           verification_token_expires_at = ?
       WHERE id = ?`,
      [verificationToken, expiresAt, userId]
    );

    // TODO: Send verification email (implementirat ćemo kasnije)
    // await sendVerificationEmail(users[0].email, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const [users]: any = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ? AND is_active = true',
      [req.user!.userId]
    );

    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 