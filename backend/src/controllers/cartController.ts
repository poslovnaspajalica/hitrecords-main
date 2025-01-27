import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get or create cart
const getOrCreateCart = async (userId?: string, sessionId?: string) => {
  const [existingCarts]: any = await pool.query(
    'SELECT * FROM carts WHERE user_id = ? OR session_id = ?',
    [userId, sessionId]
  );

  if (existingCarts.length > 0) {
    return existingCarts[0];
  }

  const cartId = uuidv4();
  await pool.query(
    'INSERT INTO carts (id, user_id, session_id) VALUES (?, ?, ?)',
    [cartId, userId, sessionId]
  );

  return { id: cartId, user_id: userId, session_id: sessionId };
};

// Get cart with items
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    const [items]: any = await pool.query(
      `SELECT 
        ci.*,
        p.name,
        p.price,
        p.sale_price,
        p.weight,
        GROUP_CONCAT(pi.url) as images
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ci.cart_id = ?
      GROUP BY ci.id`,
      [cart.id]
    );

    res.json({
      id: cart.id,
      items: items.map((item: any) => ({
        ...item,
        images: item.images ? item.images.split(',') : []
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    const { productId, quantity } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or Session ID required' });
    }

    // Check product availability
    const [products]: any = await pool.query(
      'SELECT stock_quantity FROM products WHERE id = ? AND is_active = true',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (products[0].stock_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const [existingItems]: any = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cart.id, productId]
    );

    if (existingItems.length > 0) {
      const newQuantity = existingItems[0].quantity + quantity;
      if (newQuantity > products[0].stock_quantity) {
        return res.status(400).json({ message: 'Not enough stock' });
      }

      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      const itemId = uuidv4();
      await pool.query(
        'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)',
        [itemId, cart.id, productId, quantity]
      );
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    // Verify cart ownership
    const [items]: any = await pool.query(
      `SELECT ci.*, p.stock_quantity 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND (c.user_id = ? OR c.session_id = ?)`,
      [id, userId, sessionId]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity > items[0].stock_quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
    }

    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    const [result]: any = await pool.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND (c.user_id = ? OR c.session_id = ?)`,
      [id, userId, sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart' });
  }
}; 