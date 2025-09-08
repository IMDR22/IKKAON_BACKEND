const pool = require('../config/database.js');

// Place an order with stock deduction and automatic payment record creation
const createOrder = async (req, res) => {
    const { uid } = req.user; // from verifyToken
    const { items, payment_method } = req.body; // add payment_method: 'Cash' or 'GCash'
  
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    if (!['Cash', 'GCash'].includes(payment_method)) {
      return res.status(400).json({ error: 'Invalid payment method. Must be Cash or GCash' });
    }
  
    const connection = await pool.getConnection(); // transaction
    try {
      await connection.beginTransaction();
  
      // Get MySQL user_id from firebase_uid
      const [userRows] = await connection.query(
        'SELECT user_id FROM users WHERE firebase_uid = ?',
        [uid]
      );
  
      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "User not found" });
      }
  
      const user_id = userRows[0].user_id;
  
      // Calculate total and deduct stock
      let totalAmount = 0;
      for (const item of items) {
        const [productRows] = await connection.query(
          'SELECT price, stock FROM products WHERE product_id = ? FOR UPDATE',
          [item.product_id]
        );
  
        if (productRows.length === 0) {
          await connection.rollback();
          return res.status(400).json({ error: `Product ${item.product_id} not found` });
        }
  
        const product = productRows[0];
  
        if (product.stock < item.quantity) {
          await connection.rollback();
          return res.status(400).json({
            error: `Not enough stock for ${item.product_id}, available: ${product.stock}`
          });
        }
  
        totalAmount += product.price * item.quantity;
  
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
  
      // Insert order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
        [user_id, totalAmount]
      );
  
      const order_id = orderResult.insertId;
  
      // Insert order items
      for (const item of items) {
        const [product] = await connection.query(
          'SELECT price FROM products WHERE product_id = ?',
          [item.product_id]
        );
  
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [order_id, item.product_id, item.quantity, product[0].price]
        );
      }

      // ✅ Create payment record
      await connection.query(
        'INSERT INTO payment_methods (order_id, method, payment_status) VALUES (?, ?, ?)',
        [order_id, payment_method, 'Pending']
      );
  
      await connection.commit();
  
      res.json({ 
        message: "Order placed successfully",
        order_id,
        totalAmount,
        payment_method,
        payment_status: 'Pending'
      });
    } catch (err) {
      await connection.rollback();
      console.error("🔥 Error creating order:", err);
      res.status(500).json({ error: "Database error" });
    } finally {
      connection.release();
    }
};


// Get all orders for logged-in user
const getOrders = async (req, res) => {
  const { uid } = req.user;

  try {
    const [userRows] = await pool.query(
      'SELECT user_id FROM users WHERE firebase_uid = ?',
      [uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user_id = userRows[0].user_id;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      [user_id]
    );

    res.json(orders);
  } catch (err) {
    console.error("🔥 Error fetching orders:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Get one order with items
const getOrderDetails = async (req, res) => {
    const { uid } = req.user;
    const { id } = req.params;
  
    try {
      // Get user_id from firebase_uid
      const [userRows] = await pool.query(
        'SELECT user_id FROM users WHERE firebase_uid = ?',
        [uid]
      );
  
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const user_id = userRows[0].user_id;
  
      // Get order
      const [orders] = await pool.query(
        'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
        [id, user_id]
      );
  
      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      const order = orders[0];
  
      // Get order items
      const [items] = await pool.query(
        `SELECT oi.*, p.product_name 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.product_id 
         WHERE oi.order_id = ?`,
        [id]
      );
  
      // Get payment info
      const [payments] = await pool.query(
        'SELECT payment_id, method, payment_status FROM payment_methods WHERE order_id = ?',
        [id]
      );
  
      res.json({ ...order, items, payments });
    } catch (err) {
      console.error("🔥 Error fetching order details:", err);
      res.status(500).json({ error: "Database error" });
    }
  };
  

const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body; // "Pending", "Paid", "Cancelled"
    const uid = req.user.uid; // from verifyToken
  
    try {
      const validStatuses = ["Pending", "Paid", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
  
      // Get user info (including role)
      const [userRows] = await pool.query(
        "SELECT * FROM users WHERE firebase_uid = ?",
        [uid]
      );
      const user = userRows[0];
  
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
  
      // Get order
      const [orderRows] = await pool.query(
        "SELECT * FROM orders WHERE order_id = ?",
        [order_id]
      );
  
      if (orderRows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      const order = orderRows[0];
  
      // ✅ Permission check
      if (status === "Paid") {
        // Only admin can mark as paid
        if (user.role !== "admin") {
          return res.status(403).json({ error: "Only admins can mark orders as paid" });
        }
      }
  
      if (status === "Cancelled") {
        // User can only cancel their own order
        if (user.role !== "admin" && order.user_id !== user.user_id) {
          return res.status(403).json({ error: "You can only cancel your own orders" });
        }
  
        // Restore stock
        const [items] = await pool.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
          [order_id]
        );
  
        for (const item of items) {
          await pool.query(
            "UPDATE products SET stock = stock + ? WHERE product_id = ?",
            [item.quantity, item.product_id]
          );
        }
      }
  
      // Update status
      await pool.query(
        "UPDATE orders SET status = ? WHERE order_id = ?",
        [status, order_id]
      );
  
      res.json({ message: `Order ${order_id} status updated to ${status}` });
    } catch (err) {
      console.error("🔥 Error updating status:", err);
      res.status(500).json({ error: "Database error" });
    }
  };
  
  
module.exports = { createOrder, getOrders, getOrderDetails, updateOrderStatus };
