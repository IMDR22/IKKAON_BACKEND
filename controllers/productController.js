const pool = require('../config/database.js');

// 📌 Get all products
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('🔥 Error in getProducts:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// 📌 Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('🔥 Error in getProductById:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// 📌 Add new product
const addProduct = async (req, res) => {
  try {
    const { product_name, description, price, stock } = req.body;

    if (!product_name || !price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (product_name, description, price, stock) VALUES (?, ?, ?, ?)',
      [product_name, description || null, price, stock || 0]
    );

    res.status(201).json({
      product_id: result.insertId,
      product_name,
      description,
      price,
      stock: stock || 0
    });
  } catch (err) {
    console.error('🔥 Error in addProduct:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// 📌 Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, description, price, stock } = req.body;

    const [result] = await pool.query(
      'UPDATE products SET product_name = ?, description = ?, price = ?, stock = ? WHERE product_id = ?',
      [product_name, description, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('🔥 Error in updateProduct:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// 📌 Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM products WHERE product_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('🔥 Error in deleteProduct:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
