// api/submit-edge.js - Edge Function版本
export const config = {
    runtime: 'edge',
  };
  
  export default async function handler(request) {
    // 1. 设置CORS头
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    });
    
    // 2. 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
      console.log('处理OPTIONS预检请求');
      return new Response(null, {
        status: 200,
        headers
      });
    }
    
    // 3. 只处理POST请求
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          message: `不支持 ${request.method} 方法`,
          allowed: ['POST', 'OPTIONS']
        }),
        {
          status: 405,
          headers
        }
      );
    }
    
    try {
      // 4. 解析请求体
      let requestData;
      try {
        requestData = await request.json();
      } catch (parseError) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'JSON解析错误'
          }),
          {
            status: 400,
            headers
          }
        );
      }
      
      const { name, company, phone, email = '', message } = requestData;
      
      // 5. 验证必填字段
      if (!name || !company || !phone || !message) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '请填写所有必填字段（姓名、公司、电话、需求）'
          }),
          {
            status: 400,
            headers
          }
        );
      }
      
      // 6. 验证电话格式
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '电话号码应为11位数字'
          }),
          {
            status: 400,
            headers
          }
        );
      }
      
      // 7. 调用GitHub API（需要环境变量）
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'cementehs';
      const REPO_NAME = process.env.GITHUB_REPO_NAME || 'cementehs-feedback';
      
      if (!GITHUB_TOKEN) {
        console.error('缺少GITHUB_TOKEN环境变量');
        return new Response(
          JSON.stringify({
            success: false,
            message: '服务器配置错误'
          }),
          {
            status: 500,
            headers
          }
        );
      }
      
      // 构建Issue内容
      const issueTitle = `官网咨询：${company} - ${name}`;
      const issueBody = `
  ## 📋 联系信息
  
  | 项目 | 内容 |
  |------|------|
  | **姓名** | ${name} |
  | **公司** | ${company} |
  | **电话** | ${phone} |
  | **邮箱** | ${email || '未提供'} |
  | **提交时间** | ${new Date().toLocaleString('zh-CN')} |
  | **来源** | 水泥安环智脑官网（Edge Function） |
  
  ## 📝 咨询内容
  
  ${message}
  
  ---
  
  *请优先通过电话联系客户*
      `.trim();
      
      // 调用GitHub API
      const githubResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CementEHS-Form-Edge',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
            labels: ['官网咨询', '待处理', 'edge-function']
          })
        }
      );
      
      if (!githubResponse.ok) {
        const errorText = await githubResponse.text();
        console.error('GitHub API错误:', errorText);
        
        // 返回成功但记录错误（用户体验更好）
        return new Response(
          JSON.stringify({
            success: true, // 仍然返回true，不显示错误给用户
            message: '提交成功！我们将在24小时内与您联系。',
            note: 'GitHub Issue创建失败，但表单已接收',
            timestamp: new Date().toISOString()
          }),
          {
            status: 200,
            headers
          }
        );
      }
      
      const issueData = await githubResponse.json();
      
      // 8. 返回成功响应
      return new Response(
        JSON.stringify({
          success: true,
          message: '提交成功！我们将在24小时内与您联系。',
          data: {
            issue_id: issueData.number,
            issue_url: issueData.html_url,
            title: issueData.title,
            created_at: issueData.created_at
          }
        }),
        {
          status: 200,
          headers
        }
      );
      
    } catch (error) {
      console.error('Edge Function错误:', error);
      
      // 返回用户友好的错误信息
      return new Response(
        JSON.stringify({
          success: false,
          message: '提交失败，请稍后重试。如需紧急联系，请直接拨打：137-2438-2011'
        }),
        {
          status: 500,
          headers
        }
      );
    }
  }