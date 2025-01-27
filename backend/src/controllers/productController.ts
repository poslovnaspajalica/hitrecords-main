import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

// Get all products with pagination and filters
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const minPrice = req.query.minPrice as string;
    const maxPrice = req.query.maxPrice as string;

    let query = `
      SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT c.name) as categories,
        GROUP_CONCAT(DISTINCT pi.url) as images
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.is_active = true
    `;

    const queryParams: any[] = [];

    if (category) {
      query += ` AND c.slug = ?`;
      queryParams.push(category);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ` AND p.price >= ?`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND p.price <= ?`;
      queryParams.push(maxPrice);
    }

    query += ` GROUP BY p.id LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [products]: any = await pool.query(query, queryParams);

    // Get total count for pagination
    const [countResult]: any = await pool.query(
      'SELECT COUNT(DISTINCT p.id) as total FROM products p',
      []
    );

    res.json({
      products: products.map((p: any) => ({
        ...p,
        categories: p.categories ? p.categories.split(',') : [],
        images: p.images ? p.images.split(',') : []
      })),
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get single product by slug
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const [products]: any = await pool.query(
      `SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT c.name) as categories,
        GROUP_CONCAT(DISTINCT pi.url) as images
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.slug = ? AND p.is_active = true
      GROUP BY p.id`,
      [slug]
    );

    if (products.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const product = products[0];

    // Get product attributes
    const [attributes]: any = await pool.query(
      `SELECT 
        pa.name, pav.value
      FROM product_attribute_values pav
      JOIN product_attributes pa ON pav.attribute_id = pa.id
      WHERE pav.product_id = ?`,
      [product.id]
    );

    res.json({
      ...product,
      categories: product.categories ? product.categories.split(',') : [],
      images: product.images ? product.images.split(',') : [],
      attributes: attributes.reduce((acc: any, curr: any) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Admin: Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      sku,
      stockQuantity,
      weight,
      isFeatured,
      categoryIds,
      attributes
    } = req.body;

    const productId = uuidv4();
    const slug = slugify(name, { lower: true });

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert product
      await connection.query(
        `INSERT INTO products (
          id, name, slug, description, price, sale_price,
          sku, stock_quantity, weight, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, name, slug, description, price, salePrice,
          sku, stockQuantity, weight, isFeatured
        ]
      );

      // Insert categories
      if (categoryIds?.length) {
        const categoryValues = categoryIds.map((categoryId: string) => [productId, categoryId]);
        await connection.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ?',
          [categoryValues]
        );
      }

      // Insert attributes
      if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
          const [attr]: any = await connection.query(
            'SELECT id FROM product_attributes WHERE name = ?',
            [key]
          );

          if (attr.length > 0) {
            await connection.query(
              'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)',
              [productId, attr[0].id, value]
            );
          }
        }
      }

      await connection.commit();
      res.status(201).json({
        message: 'Product created successfully',
        productId,
        slug
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      if (updates.name) {
        updates.slug = slugify(updates.name, { lower: true });
      }

      // Update product
      await connection.query(
        'UPDATE products SET ? WHERE id = ?',
        [updates, id]
      );

      // Update categories if provided
      if (updates.categoryIds) {
        await connection.query(
          'DELETE FROM product_categories WHERE product_id = ?',
          [id]
        );

        if (updates.categoryIds.length) {
          const categoryValues = updates.categoryIds.map((categoryId: string) => [id, categoryId]);
          await connection.query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ?',
            [categoryValues]
          );
        }
      }

      // Update attributes if provided
      if (updates.attributes) {
        await connection.query(
          'DELETE FROM product_attribute_values WHERE product_id = ?',
          [id]
        );

        for (const [key, value] of Object.entries(updates.attributes)) {
          const [attr]: any = await connection.query(
            'SELECT id FROM product_attributes WHERE name = ?',
            [key]
          );

          if (attr.length > 0) {
            await connection.query(
              'INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES (?, ?, ?)',
              [id, attr[0].id, value]
            );
          }
        }
      }

      await connection.commit();
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result]: any = await pool.query(
      'UPDATE products SET is_active = false WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
}; 