const pool = require("../config/database.js");

// Create a payment record
const createPayment = async (req, res) => {
  const { order_id, method, payment_reference } = req.body;

  if (!order_id || !method) {
    return res.status(400).json({ error: "Order ID and payment method are required" });
  }

  if (!["Cash", "GCash"].includes(method)) {
    return res.status(400).json({ error: "Invalid payment method" });
  }

  try {
    const [orderRows] = await pool.query("SELECT * FROM orders WHERE order_id = ?", [order_id]);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [result] = await pool.query(
      "INSERT INTO payment_methods (order_id, method, payment_status, payment_reference) VALUES (?, ?, ?, ?)",
      [order_id, method, "Pending", payment_reference || null]
    );

    res.json({
      message: "Payment record created",
      payment_id: result.insertId,
      order_id,
      method,
      payment_status: "Pending",
      payment_reference: payment_reference || null,
    });
  } catch (err) {
    console.error("🔥 Error creating payment:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  const { payment_id } = req.params;
  const { status } = req.body;

  try {
    await pool.query("UPDATE payment_methods SET payment_status = ? WHERE payment_id = ?", [
      status,
      payment_id,
    ]);

    res.json({ message: "Payment status updated" });
  } catch (err) {
    console.error("🔥 Error updating payment status:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Get payment by order ID
const getPaymentByOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM payment_methods WHERE order_id = ?", [order_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("🔥 Error fetching payment:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getPaymentByOrder,
};
