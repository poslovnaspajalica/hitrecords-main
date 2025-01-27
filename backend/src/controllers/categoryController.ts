import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

// Get all categories (with optional parent filter)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const parentId = req.query.parentId as string;
    
    let query = `
      SELECT 
        c.*,
        p.name as parent_name,
        COUNT(DISTINCT pc.product_id) as product_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN product_categories pc ON c.id = pc.category_id
    `;
    
    const params: any[] = [];
    if (parentId) {
      query += ` WHERE c.parent_id = ?`;
      params.push(parentId);
    } else {
      query += ` WHERE c.parent_id IS NULL`;
    }
    
    query += ` GROUP BY c.id`;
    
    const [categories]: any = await pool.query(query, params);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get category by slug with subcategories
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Get category
    const [categories]: any = await pool.query(
      `SELECT 
        c.*,
        p.name as parent_name,
        COUNT(DISTINCT pc.product_id) as product_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      WHERE c.slug = ?
      GROUP BY c.id`,
      [slug]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = categories[0];
    
    // Get subcategories
    const [subcategories]: any = await pool.query(
      `SELECT 
        c.*,
        COUNT(DISTINCT pc.product_id) as product_count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      WHERE c.parent_id = ?
      GROUP BY c.id`,
      [category.id]
    );
    
    res.json({
      ...category,
      subcategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Admin: Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId, isActive } = req.body;
    const id = uuidv4();
    const slug = slugify(name, { lower: true });
    
    // Check if parent exists if provided
    if (parentId) {
      const [parents]: any = await pool.query(
        'SELECT id FROM categories WHERE id = ?',
        [parentId]
      );
      
      if (parents.length === 0) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }
    
    await pool.query(
      `INSERT INTO categories (id, name, slug, description, parent_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description, parentId, isActive ?? true]
    );
    
    res.status(201).json({
      message: 'Category created successfully',
      categoryId: id,
      slug
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Admin: Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.name) {
      updates.slug = slugify(updates.name, { lower: true });
    }
    
    // Check if parent exists if provided
    if (updates.parentId) {
      const [parents]: any = await pool.query(
        'SELECT id FROM categories WHERE id = ?',
        [updates.parentId]
      );
      
      if (parents.length === 0) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      
      // Prevent circular reference
      if (updates.parentId === id) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
    }
    
    const [result]: any = await pool.query(
      'UPDATE categories SET ? WHERE id = ?',
      [updates, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Admin: Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category has subcategories
    const [subcategories]: any = await pool.query(
      'SELECT id FROM categories WHERE parent_id = ?',
      [id]
    );
    
    if (subcategories.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Delete subcategories first.' 
      });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Remove category from products
      await connection.query(
        'DELETE FROM product_categories WHERE category_id = ?',
        [id]
      );
      
      // Delete category
      const [result]: any = await connection.query(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Category not found' });
      }
      
      await connection.commit();
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
}; 