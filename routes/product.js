const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Comment = require('../models/Comment');

// Trang chi tiết sản phẩm
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Tìm sản phẩm theo ID
        if (!product) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        // Truyền thông tin sản phẩm vào view
        res.render('product-detail', { product });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Gửi đánh giá
router.post('/:id/review', async (req, res) => {
    const { rating, comment } = req.body;
    const username = req.user?.username || 'Ẩn danh';  // Nếu không đăng nhập thì mặc định là 'Ẩn danh'

    try {
        // Tìm sản phẩm theo ID
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        // Kiểm tra rating và comment
        if (!rating || !comment) {
            return res.status(400).send('Thiếu rating hoặc comment');
        }

        // Tạo một comment mới
        const newComment = new Comment({
            productId: product._id,
            username: username,
            comment: comment,
            rating: parseInt(rating, 10)  // Chuyển rating thành số nguyên
        });

        // Lưu comment mới
        await newComment.save();

        // Thêm _id của comment vào mảng reviews của sản phẩm
        product.reviews.push(newComment._id);

        // Cập nhật rating trung bình của sản phẩm
        await product.updateAverageRating();

        // Lưu lại sản phẩm với mảng reviews mới
        await product.save();

        // Redirect về trang chi tiết sản phẩm
        res.redirect(`/products/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi gửi đánh giá');
    }
});




module.exports = router;
