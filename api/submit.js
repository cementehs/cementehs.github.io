// api/submit.js - 确保正确处理OPTIONS
export default async function handler(req, res) {
  // ========== 必须放在最前面：CORS设置 ==========
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  // ========== 关键：必须处理OPTIONS请求 ==========
  if (req.method === 'OPTIONS') {
    // 直接返回200，不返回JSON
    return res.status(200).end();
  }
  
  // ========== 处理POST请求 ==========
  if (req.method === 'POST') {
    try {
      // 简单测试：总是返回成功
      return res.status(200).json({
        success: true,
        message: 'API测试成功！',
        timestamp: new Date().toISOString(),
        data: req.body || {}
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
  
  // ========== 其他方法返回405 ==========
  return res.status(405).json({
    success: false,
    message: `不支持 ${req.method} 方法`,
    allowed: ['POST', 'OPTIONS']
  });
}