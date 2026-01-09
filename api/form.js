// api/form.js - 最小Edge Function
export const config = {
    runtime: 'edge',
  };
  
  export default async function handler(request) {
    // 设置响应头
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // 处理OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: headers
      });
    }
    
    // 处理GET（用于测试）
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Edge Function工作正常',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: headers
        }
      );
    }
    
    // 处理POST
    if (request.method === 'POST') {
      try {
        const data = await request.json();
        
        return new Response(
          JSON.stringify({
            success: true,
            message: '接收成功',
            data: data,
            timestamp: new Date().toISOString()
          }),
          {
            status: 200,
            headers: headers
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'JSON解析错误'
          }),
          {
            status: 400,
            headers: headers
          }
        );
      }
    }
    
    // 其他方法
    return new Response(
      JSON.stringify({
        success: false,
        message: `不支持 ${request.method} 方法`
      }),
      {
        status: 405,
        headers: headers
      }
    );
  }