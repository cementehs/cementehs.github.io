// api/submit.js - 确保工作版本
export default async function handler(request, response) {
  // 打印调试信息
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  
  // 1. 设置CORS头 - 必须最先执行
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
  
  // 设置所有头
  Object.entries(headers).forEach(([key, value]) => {
    if (response.setHeader) {
      response.setHeader(key, value);
    }
  });
  
  // 2. 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    console.log('处理OPTIONS预检请求');
    if (response.status) {
      response.status(200);
    }
    if (response.end) {
      return response.end();
    }
    return {
      statusCode: 200,
      headers: headers
    };
  }
  
  // 3. 处理POST请求
  if (request.method === 'POST') {
    try {
      console.log('处理POST请求');
      
      // 返回成功
      const body = {
        success: true,
        message: 'API测试成功！',
        timestamp: new Date().toISOString(),
        data: request.body || {}
      };
      
      if (response.status && response.json) {
        response.status(200).json(body);
        return;
      }
      
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(body)
      };
      
    } catch (error) {
      console.error('处理错误:', error);
      
      if (response.status && response.json) {
        return response.status(500).json({
          success: false,
          message: '服务器错误'
        });
      }
      
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          success: false,
          message: '服务器错误'
        })
      };
    }
  }
  
  // 4. 其他方法
  console.log(`拒绝 ${request.method} 请求`);
  
  if (response.status && response.json) {
    return response.status(405).json({
      success: false,
      message: `不支持 ${request.method} 方法`,
      allowed: ['POST', 'OPTIONS']
    });
  }
  
  return {
    statusCode: 405,
    headers: headers,
    body: JSON.stringify({
      success: false,
      message: `不支持 ${request.method} 方法`,
      allowed: ['POST', 'OPTIONS']
    })
  };
}