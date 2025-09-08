const express = require('express');
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController.js');
const verifyToken = require('../middlewares/middleWare.js');

const router = express.Router();

router.get('/', getProducts, verifyToken);          
router.get('/:id', getProductById, verifyToken);    
router.post('/', addProduct, verifyToken);          
router.put('/:id', updateProduct, verifyToken);     
router.delete('/:id', deleteProduct, verifyToken);  

module.exports = router;
