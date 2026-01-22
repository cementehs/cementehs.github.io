const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 数据模型
const SubmissionSchema = new mongoose.Schema({
    type: String,
    data: Object,
    status: { type: String, default: 'pending' },
    notes: String,
    followup: Date,
    ip: String,
    createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: 'admin' }
});

const Submission = mongoose.model('Submission', SubmissionSchema);
const User = mongoose.model('User', UserSchema);

// 路由
app.post('/api/submit', async (req, res) => {
    try {
        const submission = new Submission({
            type: req.headers['x-form-type'],
            data: req.body,
            ip: req.ip
        });
        
        await submission.save();
        
        // 发送邮件通知
        sendNotificationEmail(submission);
        
        res.json({ 
            success: true, 
            message: '提交成功',
            id: submission._id 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: '用户不存在' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: '密码错误' });
    }
    
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    res.json({ token, user: { username: user.username, role: user.role } });
});

app.get('/api/admin/submissions', authenticate, async (req, res) => {
    const { type, status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const submissions = await Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
    const total = await Submission.countDocuments(filter);
    
    res.json({
        submissions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// 中间件
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: '认证失败' });
    }
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});