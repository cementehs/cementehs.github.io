// api/submit.js - 表单提交处理API
export default async function handler(req, res) {
    // 只接受 POST 请求
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: '只支持 POST 请求' 
      });
    }
  
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    try {
      // 获取环境变量
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'cementehs';
      const REPO_NAME = process.env.GITHUB_REPO_NAME || 'cementehs-feedback';
  
      if (!GITHUB_TOKEN) {
        console.error('缺少 GITHUB_TOKEN 环境变量');
        return res.status(500).json({ 
          success: false, 
          message: '服务器配置错误' 
        });
      }
  
      // 获取表单数据
      const { 
        name, 
        company, 
        phone, 
        email = '', 
        message 
      } = req.body;
  
      // 验证必填字段
      if (!name || !company || !phone || !message) {
        return res.status(400).json({ 
          success: false, 
          message: '请填写所有必填字段' 
        });
      }
  
      // 获取客户端 IP 和用户代理
      const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || '未知';
  
      // 构建 Issue 内容
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
  | **来源** | 水泥安环智脑官网 |
  
  ## 📝 咨询内容
  
  ${message}
  
  ---
  
  ## 🔍 技术信息
  
  | 项目 | 内容 |
  |------|------|
  | **IP 地址** | ${clientIP} |
  | **用户代理** | ${userAgent} |
  | **提交方式** | API 表单 |
  
  **请优先通过电话联系客户**
      `.trim();
  
      // 调用 GitHub API 创建 Issue
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CementEHS-Form-API',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
            labels: [
              '官网咨询',
              '待处理',
              company.includes('华润') ? '华润客户' : '普通客户'
            ].filter(Boolean)
          })
        }
      );
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('GitHub API 错误:', errorData);
        throw new Error(`GitHub API 返回 ${response.status}`);
      }
  
      const issueData = await response.json();
      
      // 返回成功响应
      return res.status(200).json({
        success: true,
        message: '提交成功！我们将在24小时内与您联系。',
        data: {
          issue_id: issueData.number,
          issue_url: issueData.html_url,
          title: issueData.title,
          created_at: issueData.created_at
        }
      });
  
    } catch (error) {
      console.error('表单提交错误:', error);
      
      // 返回错误响应
      return res.status(500).json({
        success: false,
        message: '提交失败，请稍后重试。如需紧急联系，请直接拨打：137-2438-2011',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }