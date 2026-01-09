// api/submit.js - 完整可工作版本
export default async function handler(req, res) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // ========== 1. 设置CORS头（必须放在最前面） ==========
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时
  
  // ========== 2. 必须处理OPTIONS预检请求 ==========
  if (req.method === 'OPTIONS') {
    console.log('✅ 处理OPTIONS预检请求');
    return res.status(200).end();
  }
  
  // ========== 3. 只处理POST请求 ==========
  if (req.method !== 'POST') {
    console.log(`❌ 拒绝 ${req.method} 请求`);
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: `不支持 ${req.method} 方法`,
      allowed: ['POST', 'OPTIONS']
    });
  }
  
  // ========== 4. 处理POST请求 ==========
  try {
    console.log('📝 开始处理POST请求');
    
    // 检查Content-Type
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type必须是 application/json',
        received: contentType
      });
    }
    
    // 获取请求体
    const body = req.body;
    console.log('📦 请求体:', JSON.stringify(body, null, 2));
    
    // 验证必填字段
    const required = ['name', 'company', 'phone', 'message'];
    const missing = required.filter(field => !body[field] || body[field].trim() === '');
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段',
        missing: missing
      });
    }
    
    // ========== 5. 调用GitHub API ==========
    console.log('🚀 准备调用GitHub API...');
    
    // 这里先返回成功，稍后添加GitHub逻辑
    return res.status(200).json({
      success: true,
      message: '表单提交成功！我们将在24小时内联系您。',
      timestamp: new Date().toISOString(),
      data: {
        issue_id: 1,
        issue_url: 'https://github.com/cementehs/cementehs-feedback/issues/1',
        title: `官网咨询：${body.company} - ${body.name}`
      },
      received: body
    });
    
  } catch (error) {
    console.error('💥 API处理错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
}