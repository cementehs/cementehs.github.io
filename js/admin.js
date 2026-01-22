// 管理后台主功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initAdmin();
    
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 登出按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 菜单切换
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            switchSection(target);
        });
    });
    
    // 编辑表单提交
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEdit);
    }
    
    // 模态框关闭
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // 检查登录状态
    checkAuth();

    // 测试数据按钮
    const testDataBtn = document.getElementById('add-test-data');
    if (testDataBtn) {
        testDataBtn.addEventListener('click', function() {
            if (confirm('确定要添加测试数据吗？这会覆盖现有数据。')) {
                createInstantTestData();
            }
        });
    }
});

// 初始化
// 简化的初始化函数
function initAdmin() {
    console.log('=== 初始化管理后台 ===');
    
    try {
        // 1. 加载统计数据
        console.log('1. 加载统计数据...');
        loadStats();
        
        // 2. 加载最近提交
        console.log('2. 加载最近提交...');
        loadRecentSubmissions();
        
        // 3. 更新计数
        console.log('3. 更新计数...');
        updateCounts();
        
        console.log('✅ 初始化完成');
    } catch (error) {
        console.error('❌ 初始化失败:', error);
    }
}

// 登录处理
// 完全重写的登录处理函数
async function handleLogin(e) {
    e.preventDefault();
    console.log('=== 登录流程开始 ===');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    console.log('输入的用户名:', username);
    console.log('输入的密码:', password);
    
    // 简单验证（生产环境应该使用服务器验证）
    if (username === 'admin' && password === 'AnHuan2024') {
        console.log('✅ 验证通过');
        
        // 保存登录状态
        const authData = {
            username: username,
            timestamp: Date.now(),
            remember: remember
        };
        
        localStorage.setItem('admin_auth', JSON.stringify(authData));
        console.log('✅ 登录状态已保存到 localStorage');
        
        // 强制切换页面 - 使用最直接的方法
        forceShowDashboard(username);
        
    } else {
        console.log('❌ 验证失败');
        alert('用户名或密码错误，请使用 admin / AnHuan2024');
    }
}

// 强制显示管理页面
function forceShowDashboard(username) {
    console.log('开始切换页面...');
    
    // 方法1: 直接修改样式
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    
    console.log('登录页面元素:', loginPage);
    console.log('管理页面元素:', dashboardPage);
    
    if (loginPage) {
        loginPage.style.display = 'none';
        console.log('✅ 登录页面已隐藏');
    } else {
        console.error('❌ 未找到登录页面元素');
    }
    
    if (dashboardPage) {
        dashboardPage.style.display = 'block';
        dashboardPage.style.visibility = 'visible';
        dashboardPage.style.opacity = '1';
        console.log('✅ 管理页面已显示');
        
        // 更新用户名
        const userSpan = document.getElementById('current-user');
        if (userSpan) {
            userSpan.textContent = username;
            console.log('✅ 用户名已更新:', username);
        }
        
        // 初始化管理页面
        setTimeout(() => {
            try {
                console.log('开始初始化管理页面...');
                initAdmin();
                console.log('✅ 管理页面初始化完成');
            } catch (error) {
                console.error('❌ 初始化失败:', error);
            }
        }, 100);
        
    } else {
        console.error('❌ 未找到管理页面元素');
    }
    
    // 方法2: 如果上面的方法不行，尝试完全重新渲染
    setTimeout(() => {
        console.log('检查页面状态...');
        console.log('登录页面display:', loginPage?.style.display);
        console.log('管理页面display:', dashboardPage?.style.display);
    }, 200);
}

// 检查认证
function checkAuth() {
    const authData = JSON.parse(localStorage.getItem('admin_auth') || 'null');
    
    if (authData) {
        // 检查是否过期（24小时）
        const hoursElapsed = (Date.now() - authData.timestamp) / (1000 * 60 * 60);
        
        if (hoursElapsed < 24 || authData.remember) {
            // 已登录，显示管理页面
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('dashboard-page').style.display = 'block';
            
            // 显示用户名
            const userSpan = document.getElementById('current-user');
            if (userSpan) {
                userSpan.textContent = authData.username;
            }
        } else {
            // 登录过期
            localStorage.removeItem('admin_auth');
        }
    }
}

// 登出
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('admin_auth');
        location.reload();
    }
}

// 切换页面
// 修改 switchSection 函数
// 正确的页面切换
function switchSection(sectionId) {
    console.log('切换到页面:', sectionId);
    
    // 清除所有active类
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 激活目标页面
    const targetSection = document.getElementById(sectionId);
    const targetMenuItem = document.querySelector(`[href="#${sectionId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
    
    // 加载对应数据
    switch(sectionId) {
        case 'consultations':
            loadConsultations();
            break;
        case 'wechat':
            loadWechatSubmissions();
            break;
        case 'partnership':
            loadPartnershipSubmissions();
            break;
        case 'other':
            loadOtherSubmissions();
            break;
        case 'dashboard':
            loadStats();
            loadRecentSubmissions();
            break;
        default:
            console.log('未知页面:', sectionId);
            // 默认显示dashboard
            document.getElementById('dashboard').classList.add('active');
            document.querySelector('[href="#dashboard"]').classList.add('active');
            loadStats();
            loadRecentSubmissions();
    }
}

// 在 admin.js 的 loadStats 函数之前添加以下代码

// 更新图表（简化版）
function updateCharts(submissions) {
    console.log('图表更新被调用，数据量：', submissions.length);
    
    // 获取图表容器
    const submissionChart = document.getElementById('submission-chart');
    const typeChart = document.getElementById('type-chart');
    
    if (!submissionChart || !typeChart) {
        console.log('图表容器未找到，跳过图表更新');
        return;
    }
    
    // 示例：简单的文本图表（可以替换为Chart.js或ECharts）
    updateSubmissionChart(submissions);
    updateTypeChart(submissions);
}

// 更新提交趋势图表
function updateSubmissionChart(submissions) {
    const chartElement = document.getElementById('submission-chart');
    if (!chartElement) return;
    
    // 按日期分组（最近7天）
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('zh-CN', {month: 'short', day: 'numeric'});
    });
    
    // 模拟数据
    const data = last7Days.map(day => Math.floor(Math.random() * 20) + 5);
    
    const maxValue = Math.max(...data);
    const chartHeight = 150;
    
    let html = '<div style="display: flex; align-items: flex-end; height: 150px; gap: 15px; justify-content: center;">';
    
    data.forEach((value, index) => {
        const height = (value / maxValue) * chartHeight;
        const percent = ((value / maxValue) * 100).toFixed(0);
        
        html += `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="width: 30px; height: ${height}px; background: linear-gradient(to top, var(--primary-color) 0%, #1a4177 100%); border-radius: 4px;"></div>
                <div style="margin-top: 5px; font-size: 0.8rem; color: var(--text-light);">${value}</div>
                <div style="margin-top: 5px; font-size: 0.7rem; color: var(--text-light);">${last7Days[index]}</div>
            </div>
        `;
    });
    
    html += '</div>';
    chartElement.innerHTML = html;
}

// 更新类型分布图表
function updateTypeChart(submissions) {
    const chartElement = document.getElementById('type-chart');
    if (!chartElement) return;
    
    // 计算各类型数量
    const typeCounts = {
        'consultation': 0,
        'wechat': 0,
        'partnership': 0,
        'other': 0
    };
    
    submissions.forEach(item => {
        const type = item.type || 'consultation';
        if (typeCounts[type] !== undefined) {
            typeCounts[type]++;
        }
    });
    
    const colors = ['#2A5B9E', '#4CAF50', '#FF9800', '#9C27B0'];
    const labels = ['预约咨询', '微信咨询', '合作洽谈', '其他咨询'];
    const types = ['consultation', 'wechat', 'partnership', 'other'];
    
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    
    types.forEach((type, index) => {
        const count = typeCounts[type] || 0;
        const total = submissions.length || 1;
        const percent = ((count / total) * 100).toFixed(1);
        
        html += `
            <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: ${colors[index]}; border-radius: 2px; margin-right: 10px;"></div>
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span style="font-size: 0.9rem;">${labels[index]}</span>
                        <span style="font-size: 0.9rem; font-weight: bold;">${count}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: ${colors[index]}; border-radius: 4px;"></div>
                    </div>
                    <div style="text-align: right; font-size: 0.8rem; color: var(--text-light); margin-top: 2px;">
                        ${percent}%
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    chartElement.innerHTML = html;
}

// 加载微信咨询数据
function loadWechatSubmissions() {
    console.log('加载微信咨询数据');
    // 简单实现，显示提示
    const container = document.querySelector('#wechat .table-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                微信咨询功能正在开发中...
            </div>
        `;
    }
}

// 加载合作洽谈数据
function loadPartnershipSubmissions() {
    console.log('加载合作洽谈数据');
    const container = document.querySelector('#partnership .table-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                合作洽谈功能正在开发中...
            </div>
        `;
    }
}

// 加载其他咨询数据
function loadOtherSubmissions() {
    console.log('加载其他咨询数据');
    const container = document.querySelector('#other .table-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                其他咨询功能正在开发中...
            </div>
        `;
    }
}

// 加载统计数据
function loadStats() {
    const submissions = getAllSubmissions();
    
    // 总提交量
    document.getElementById('total-submissions').textContent = submissions.length;
    
    // 今日新增
    const today = new Date().toLocaleDateString();
    const todayCount = submissions.filter(s => 
        new Date(s.timestamp).toLocaleDateString() === today
    ).length;
    document.getElementById('today-submissions').textContent = todayCount;
    
    // 更新计数
    updateCounts();
    
    // 更新图表（简化版）
    updateCharts(submissions);
}

// 获取所有提交
// 增强的数据获取函数
function getAllSubmissions() {
    console.log('开始获取所有提交数据...');
    
    // 从 localStorage 获取数据
    const data = localStorage.getItem('cement_submissions');
    if (!data) {
        console.log('没有找到数据');
        return [];
    }
    
    let submissions = [];
    try {
        submissions = JSON.parse(data);
        console.log(`解析到 ${submissions.length} 条数据`);
    } catch (e) {
        console.error('解析数据失败:', e);
        return [];
    }
    
    // 标准化所有数据
    const normalizedData = submissions.map(sub => normalizeSubmission(sub));
    
    // 按时间倒序排序
    return normalizedData.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.id || 0).getTime();
        const timeB = new Date(b.timestamp || b.id || 0).getTime();
        return timeB - timeA;
    });
}

// 更新计数
function updateCounts() {
    const submissions = getAllSubmissions();
    
    const counts = {
        consultation: 0,
        wechat: 0,
        partnership: 0,
        other: 0
    };
    
    submissions.forEach(item => {
        const type = item.type || 'consultation';
        if (counts[type] !== undefined) {
            counts[type]++;
        }
    });
    
    // 更新UI
    document.getElementById('consultation-count').textContent = counts.consultation;
    document.getElementById('wechat-count').textContent = counts.wechat;
    document.getElementById('partnership-count').textContent = counts.partnership;
    document.getElementById('other-count').textContent = counts.other;
}

// 加载最近提交
function loadRecentSubmissions() {
    const submissions = getAllSubmissions().slice(0, 10);
    const tbody = document.getElementById('recent-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    submissions.forEach(sub => {
        const row = document.createElement('tr');
        
        const name = sub['consult-name'] || sub['wechat-name'] || sub['partner-name'] || sub['other-name'] || '未知';
        const company = sub['consult-company'] || sub['wechat-company'] || sub['partner-company'] || sub['other-company'] || '-';
        const type = sub.type || '未知';
        
        row.innerHTML = `
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${getTypeLabel(type)}</td>
            <td><span class="status-badge status-pending">待处理</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewDetail(${sub.id})">查看</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 加载预约咨询
function loadConsultations() {
    console.log('=== 加载预约咨询数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'consultation' || (!s.type && (s['consult-name'] || s.name))
    );
    
    console.log('过滤后的咨询数据:', submissions.length, '条');
    
    const tbody = document.getElementById('consultation-table-body');
    if (!tbody) {
        console.error('未找到表格tbody元素');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    暂无预约咨询数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        console.log(`第${index + 1}条数据:`, sub);
        
        const status = sub.status || 'pending';
        const type = sub.type || 'consultation';
        
        // 使用统一的字段获取方式
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const service = getSubmissionField(sub, 'service', type) || '-';
        const time = getSubmissionField(sub, 'time', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${position}</td>
            <td>${getServiceLabel(service)}</td>
            <td>${getTimeLabel(time)}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('表格数据加载完成');
}

// 查看详情
// 在 admin.js 中添加或修改 viewDetail 函数
function viewDetail(id) {
    console.log('=== 查看详情函数被调用 ===');
    console.log('接收到的ID:', id, '类型:', typeof id);
    
    // 获取所有数据
    const submissions = getAllSubmissions();
    console.log('总数据量:', submissions.length);
    
    // 查找对应ID的记录
    const submission = submissions.find(s => {
        // 尝试多种方式匹配ID
        if (s.id === id) return true;
        if (s.id == id) return true; // 宽松比较
        if (Number(s.id) === Number(id)) return true;
        if (String(s.id) === String(id)) return true;
        return false;
    });
    
    if (!submission) {
        console.error('未找到ID为', id, '的记录');
        showNotification('未找到该记录', 'error');
        return;
    }
    
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');
    
    if (!modal || !content) {
        console.error('模态框元素未找到');
        showNotification('页面元素加载失败，请刷新页面', 'error');
        return;
    }
    
    // 构建详情内容
    content.innerHTML = buildDetailHTML(submission);
    
    // 显示模态框
    modal.style.display = 'block';
    
    // 不要设置 body 的 overflow: hidden，让模态框自己处理滚动
    // document.body.style.overflow = 'hidden';
    
    // 确保模态框滚动到顶部
    setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        
        // 滚动页面到模态框位置
        modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    console.log('详情模态框已显示');
}

// 构建详情HTML的函数
function buildDetailHTML(submission) {
    const type = submission.type || 'consultation';
    
    // 获取通用字段
    const name = getSubmissionField(submission, 'name', type) || '未知';
    const company = getSubmissionField(submission, 'company', type) || '-';
    const email = getSubmissionField(submission, 'email', type) || '-';
    const phone = getSubmissionField(submission, 'phone', type) || '-';
    const position = getSubmissionField(submission, 'position', type) || '-';
    
    // 构建HTML - 使用更简洁的布局
    let html = `
        <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-field">
                <div class="detail-label">记录ID：</div>
                <div class="detail-value"><code>${submission.id}</code></div>
            </div>
            <div class="detail-field">
                <div class="detail-label">提交时间：</div>
                <div class="detail-value">${submission.timestamp || '-'}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">咨询类型：</div>
                <div class="detail-value">${getTypeLabel(type)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">状态：</div>
                <div class="detail-value">
                    <span class="status-badge status-${submission.status || 'pending'}">
                        ${getStatusLabel(submission.status || 'pending')}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>联系人信息</h3>
            <div class="detail-field">
                <div class="detail-label">姓名：</div>
                <div class="detail-value"><strong>${name}</strong></div>
            </div>
            <div class="detail-field">
                <div class="detail-label">职位：</div>
                <div class="detail-value">${position}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">公司：</div>
                <div class="detail-value">${company}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">邮箱：</div>
                <div class="detail-value">
                    ${email ? `<a href="mailto:${email}" class="text-link">${email}</a>` : '-'}
                </div>
            </div>
            <div class="detail-field">
                <div class="detail-label">手机：</div>
                <div class="detail-value">
                    ${phone ? `<a href="tel:${phone}" class="text-link">${phone}</a>` : '-'}
                </div>
            </div>
        </div>
    `;
    
    // 根据不同类型显示特定字段
    if (type === 'consultation') {
        html += buildConsultationDetail(submission);
    } else if (type === 'wechat') {
        html += buildWechatDetail(submission);
    } else if (type === 'partnership') {
        html += buildPartnershipDetail(submission);
    } else if (type === 'other') {
        html += buildOtherDetail(submission);
    }
    
    // 如果有备注，显示备注
    if (submission.notes) {
        html += `
            <div class="detail-section">
                <h3>处理备注</h3>
                <div class="detail-field">
                    <div class="detail-label"></div>
                    <div class="detail-value">
                        <div class="notes-box">
                            ${submission.notes}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}

// 添加一些辅助样式类
const style = document.createElement('style');
style.textContent = `
    .text-link {
        color: var(--primary-color);
        text-decoration: none;
    }
    
    .text-link:hover {
        text-decoration: underline;
    }
    
    .notes-box {
        background: #f0f7ff;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid var(--primary-color);
        line-height: 1.6;
        max-height: 150px;
        overflow-y: auto;
    }
    
    .content-box {
        background: #f9f9f9;
        padding: 1rem;
        border-radius: 5px;
        line-height: 1.6;
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
    }
    
    .scrollable-content {
        max-height: 150px;
        overflow-y: auto;
        padding-right: 5px;
    }
    
    /* 自定义滚动条 */
    .scrollable-content::-webkit-scrollbar {
        width: 6px;
    }
    
    .scrollable-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    .scrollable-content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }
    
    .scrollable-content::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`;
document.head.appendChild(style);

// 预约咨询详情
// 在构建详情时，为长文本添加滚动容器
function buildConsultationDetail(sub) {
    return `
        <div class="detail-section">
            <h3>咨询详情</h3>
            <div class="detail-field">
                <div class="detail-label">行业：</div>
                <div class="detail-value">${getIndustryLabel(sub.industry)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">感兴趣服务：</div>
                <div class="detail-value">${getServiceLabel(sub.service)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">期望时间：</div>
                <div class="detail-value">${getTimeLabel(sub.time)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">订阅资讯：</div>
                <div class="detail-value">${sub.newsletter ? '是' : '否'}</div>
            </div>
        </div>
        
        ${sub.needs ? `
        <div class="detail-section">
            <h3>需求描述</h3>
            <div class="detail-field">
                <div class="detail-label"></div>
                <div class="detail-value">
                    <div class="content-box scrollable-content">
                        ${sub.needs}
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// 类似地修改其他构建函数...


// 微信咨询详情
function buildWechatDetail(sub) {
    return `
        <div class="detail-section">
            <h3>微信咨询详情</h3>
            <div class="detail-field">
                <div class="detail-label">职位：</div>
                <div class="detail-value">${sub.position || '-'}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">行业：</div>
                <div class="detail-value">${getIndustryLabel(sub.industry)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">添加目的：</div>
                <div class="detail-value">${getPurposeLabel(sub.purpose)}</div>
            </div>
        </div>
    `;
}

// 合作洽谈详情
function buildPartnershipDetail(sub) {
    return `
        <div class="detail-section">
            <h3>合作洽谈详情</h3>
            <div class="detail-field">
                <div class="detail-label">职位：</div>
                <div class="detail-value">${sub.position || '-'}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">公司类型：</div>
                <div class="detail-value">${getCompanyTypeLabel(sub.companyType)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">公司网址：</div>
                <div class="detail-value">
                    ${sub.website ? `<a href="${sub.website}" target="_blank">${sub.website}</a>` : '-'}
                </div>
            </div>
            <div class="detail-field">
                <div class="detail-label">合作类型：</div>
                <div class="detail-value">${getCooperationLabel(sub.cooperation)}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>公司及产品介绍</h3>
            <div class="detail-field">
                <div class="detail-label"></div>
                <div class="detail-value">
                    <div style="background: #f9f9f9; padding: 1rem; border-radius: 5px; line-height: 1.6; white-space: pre-wrap;">
                        ${sub.description || '无'}
                    </div>
                </div>
            </div>
        </div>
        
        ${sub.expectation ? `
        <div class="detail-section">
            <h3>合作期望</h3>
            <div class="detail-field">
                <div class="detail-label"></div>
                <div class="detail-value">
                    <div style="background: #f9f9f9; padding: 1rem; border-radius: 5px; line-height: 1.6; white-space: pre-wrap;">
                        ${sub.expectation}
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// 其他咨询详情
function buildOtherDetail(sub) {
    return `
        <div class="detail-section">
            <h3>其他咨询详情</h3>
            <div class="detail-field">
                <div class="detail-label">咨询类别：</div>
                <div class="detail-value">${getCategoryLabel(sub.category)}</div>
            </div>
            <div class="detail-field">
                <div class="detail-label">咨询主题：</div>
                <div class="detail-value">${sub.subject || '-'}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>咨询内容</h3>
            <div class="detail-field">
                <div class="detail-label"></div>
                <div class="detail-value">
                    <div style="background: #f9f9f9; padding: 1rem; border-radius: 5px; line-height: 1.6; white-space: pre-wrap;">
                        ${sub.content || '无'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 编辑提交
function editSubmission(id) {
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) return;
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-type').value = submission.type;
    document.getElementById('edit-status').value = submission.status || 'pending';
    document.getElementById('edit-notes').value = submission.notes || '';
    
    if (submission.followup) {
        document.getElementById('edit-followup').value = 
            new Date(submission.followup).toISOString().slice(0, 16);
    }
    
    document.getElementById('edit-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 处理编辑
function handleEdit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const status = document.getElementById('edit-status').value;
    const notes = document.getElementById('edit-notes').value;
    const followup = document.getElementById('edit-followup').value;
    
    // 更新本地存储
    updateSubmission(id, {
        status: status,
        notes: notes,
        followup: followup,
        updatedAt: new Date().toLocaleString()
    });
    
    // 关闭模态框
    closeEditModal();
    
    // 刷新数据
    const currentSection = document.querySelector('.content-section.active').id;
    switchSection(currentSection);
    
    showNotification('更新成功', 'success');
}

// 更新提交数据
function updateSubmission(id, updates) {
    // 更新主存储
    let main = JSON.parse(localStorage.getItem('cement_submissions') || '[]');
    main = main.map(item => {
        if (item.id == id) {
            return { ...item, ...updates };
        }
        return item;
    });
    localStorage.setItem('cement_submissions', JSON.stringify(main));
    
    // 更新备份存储
    let backup = JSON.parse(localStorage.getItem('cement_submissions_backup') || '[]');
    backup = backup.map(item => {
        if (item.id == id) {
            return { ...item, ...updates };
        }
        return item;
    });
    localStorage.setItem('cement_submissions_backup', JSON.stringify(backup));
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('edit-form').reset();
}

// 导出数据
function exportData(type = 'all') {
    console.log('导出数据，类型:', type);
    
    const submissions = getAllSubmissions();
    let filtered = submissions;
    
    if (type !== 'all') {
        filtered = submissions.filter(s => s.type === type);
    }
    
    console.log('要导出的数据量:', filtered.length);
    
    if (filtered.length === 0) {
        alert('没有数据可以导出');
        return;
    }
    
    // 构建CSV头部
    let csv = '提交ID,提交时间,类型,姓名,职位,公司,行业,邮箱,手机,服务,需求,期望时间,状态,备注\n';
    
    // 添加数据行
    filtered.forEach(sub => {
        const row = [
            sub.id || '',
            sub.timestamp || '',
            getTypeLabel(sub.type) || '',
            sub['consult-name'] || sub['wechat-name'] || sub['partner-name'] || sub['other-name'] || '',
            sub['consult-position'] || sub['wechat-position'] || sub['partner-position'] || '',
            sub['consult-company'] || sub['wechat-company'] || sub['partner-company'] || sub['other-company'] || '',
            getIndustryLabel(sub['consult-industry'] || sub['wechat-industry']) || '',
            sub['consult-email'] || sub['wechat-email'] || sub['partner-email'] || sub['other-email'] || '',
            sub['consult-phone'] || sub['wechat-phone'] || sub['partner-phone'] || sub['other-phone'] || '',
            getServiceLabel(sub['consult-service']) || getPurposeLabel(sub['wechat-purpose']) || getCooperationLabel(sub['partner-cooperation']) || getCategoryLabel(sub['other-category']) || '',
            (sub['consult-needs'] || sub['partner-description'] || sub['other-content'] || '').replace(/"/g, '""').replace(/\n/g, ' '),
            getTimeLabel(sub['consult-time']) || '',
            getStatusLabel(sub.status) || '',
            (sub.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')
        ];
        
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // 创建下载
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `水泥安环智脑_${getTypeLabel(type)}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('数据导出完成，文件名:', link.download);
    alert(`数据导出成功！共导出 ${filtered.length} 条记录。`);
}

// 辅助函数
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

function getTypeLabel(type) {
    const labels = {
        'consultation': '预约咨询',
        'wechat': '微信咨询',
        'partnership': '合作洽谈',
        'other': '其他咨询'
    };
    return labels[type] || type;
}

function getStatusLabel(status) {
    const labels = {
        'pending': '待处理',
        'contacted': '已联系',
        'scheduled': '已安排',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return labels[status] || status;
}

function getIndustryLabel(industry) {
    const labels = {
        'cement': '水泥生产',
        'mine': '水泥矿山',
        'concrete': '商混站',
        'supplier': '供应商/服务商',
        'other': '其他'
    };
    return labels[industry] || industry;
}

function getServiceLabel(service) {
    const labels = {
        'diagnosis': '数字化诊断与规划',
        'selection': '供应商选型陪跑',
        'implementation': '项目实施顾问',
        'advisory': '年度顾问服务',
        'all': '全部，需要整体规划'
    };
    return labels[service] || service;
}

function getTimeLabel(time) {
    const labels = {
        'morning': '工作日上午 (9:00-12:00)',
        'afternoon': '工作日下午 (14:00-18:00)',
        'evening': '工作日晚上 (19:00-21:00)',
        'weekend': '周末 (需具体沟通)'
    };
    return labels[time] || time;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加通知样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);

// 获取服务标签
function getServiceLabel(service) {
    const labels = {
        'diagnosis': '数字化诊断',
        'selection': '供应商选型',
        'implementation': '项目实施',
        'advisory': '年度顾问',
        'all': '整体规划'
    };
    return labels[service] || service;
}

// 获取时间标签
function getTimeLabel(time) {
    const labels = {
        'morning': '工作日上午',
        'afternoon': '工作日下午',
        'evening': '工作日晚上',
        'weekend': '周末'
    };
    return labels[time] || time;
}

// 获取行业标签
function getIndustryLabel(industry) {
    const labels = {
        'cement': '水泥生产',
        'mine': '水泥矿山',
        'concrete': '商混站',
        'supplier': '供应商',
        'other': '其他'
    };
    return labels[industry] || industry;
}

// 创建测试数据（仅用于开发）
function createTestData() {
    console.log('创建测试数据...');
    
    const testData = [
        {
            id: Date.now() - 86400000,
            type: 'consultation',
            timestamp: new Date(Date.now() - 86400000).toLocaleString(),
            'consult-name': '张三',
            'consult-position': '安全总监',
            'consult-company': '海螺水泥',
            'consult-industry': 'cement',
            'consult-email': 'zhangsan@example.com',
            'consult-phone': '13800138000',
            'consult-service': 'diagnosis',
            'consult-needs': '需要数字化安全管理系统，提高事故预防能力',
            'consult-time': 'morning',
            'consult-newsletter': true,
            status: 'pending'
        },
        {
            id: Date.now() - 172800000,
            type: 'consultation',
            timestamp: new Date(Date.now() - 172800000).toLocaleString(),
            'consult-name': '李四',
            'consult-position': '生产经理',
            'consult-company': '华新水泥',
            'consult-industry': 'cement',
            'consult-email': 'lisi@example.com',
            'consult-phone': '13900139000',
            'consult-service': 'implementation',
            'consult-needs': '寻找项目实施顾问，帮助数字化工厂建设',
            'consult-time': 'afternoon',
            'consult-newsletter': true,
            status: 'contacted'
        },
        {
            id: Date.now() - 259200000,
            type: 'wechat',
            timestamp: new Date(Date.now() - 259200000).toLocaleString(),
            'wechat-name': '王五',
            'wechat-company': '冀东水泥',
            'wechat-position': 'EHS经理',
            'wechat-industry': 'cement',
            'wechat-purpose': 'resource',
            status: 'pending'
        }
    ];
    
    // 保存到本地存储
    localStorage.setItem('cement_submissions', JSON.stringify(testData));
    
    console.log('测试数据已创建，共', testData.length, '条记录');
    return testData;
}

// 在initAdmin中添加测试数据（如果数据为空）
function initAdmin() {
    console.log('=== 初始化管理后台 ===');
    
    // 检查是否有数据
    const submissions = getAllSubmissions();
    if (submissions.length === 0) {
        console.log('没有数据，创建测试数据...');
        createTestData();
    }
    
    try {
        // 1. 加载统计数据
        console.log('1. 加载统计数据...');
        loadStats();
        
        // 2. 加载最近提交
        console.log('2. 加载最近提交...');
        loadRecentSubmissions();
        
        // 3. 更新计数
        console.log('3. 更新计数...');
        updateCounts();
        
        // 4. 加载预约咨询数据
        console.log('4. 加载预约咨询数据...');
        loadConsultations();
        
        console.log('✅ 初始化完成');
    } catch (error) {
        console.error('❌ 初始化失败:', error);
    }
}


// 在 admin.js 中添加
function createInstantTestData() {
    console.log('=== 创建即时测试数据 ===');
    
    const testData = [
        {
            id: Date.now(),
            type: 'consultation',
            timestamp: new Date().toLocaleString('zh-CN'),
            'consult-name': '测试用户张经理',
            'consult-position': '安全总监',
            'consult-company': '海螺水泥股份有限公司',
            'consult-industry': 'cement',
            'consult-email': 'zhangjl@example.com',
            'consult-phone': '13800138000',
            'consult-service': 'diagnosis',
            'consult-needs': '我们工厂希望进行数字化安全转型，目前面临事故率高、管理效率低的问题，需要专业诊断和规划。',
            'consult-time': 'morning',
            'consult-newsletter': true,
            'consult-terms': true,
            status: 'pending'
        },
        {
            id: Date.now() - 86400000,
            type: 'consultation',
            timestamp: new Date(Date.now() - 86400000).toLocaleString('zh-CN'),
            'consult-name': '李工程师',
            'consult-position': 'EHS工程师',
            'consult-company': '华新水泥集团',
            'consult-industry': 'cement',
            'consult-email': 'liengineer@example.com',
            'consult-phone': '13900139000',
            'consult-service': 'implementation',
            'consult-needs': '已经完成了初步规划，需要寻找实施顾问，确保数字化项目顺利落地。',
            'consult-time': 'afternoon',
            'consult-newsletter': false,
            'consult-terms': true,
            status: 'contacted',
            notes: '已电话联系，预约了下周的视频会议。'
        },
        {
            id: Date.now() - 172800000,
            type: 'wechat',
            timestamp: new Date(Date.now() - 172800000).toLocaleString('zh-CN'),
            'wechat-name': '王总',
            'wechat-company': '冀东水泥有限公司',
            'wechat-position': '副总经理',
            'wechat-industry': 'cement',
            'wechat-purpose': 'consult',
            'wechat-terms': true,
            status: 'pending'
        },
        {
            id: Date.now() - 259200000,
            type: 'partnership',
            timestamp: new Date(Date.now() - 259200000).toLocaleString('zh-CN'),
            'partner-name': '刘经理',
            'partner-position': '销售总监',
            'partner-company': '智能安全设备有限公司',
            'partner-type': 'hardware',
            'partner-email': 'liu@example.com',
            'partner-phone': '13700137000',
            'partner-website': 'https://www.safety-tech.com',
            'partner-cooperation': 'supplier',
            'partner-description': '我们提供智能安全帽、气体检测仪等工业安全硬件设备，希望成为贵公司的供应商。',
            'partner-expectation': '希望能建立长期合作关系，共同开拓水泥行业安全市场。',
            'partner-terms': true,
            status: 'pending'
        }
    ];
    
    // 保存到主存储
    localStorage.setItem('cement_submissions', JSON.stringify(testData));
    
    console.log('✅ 测试数据已创建，共', testData.length, '条记录');
    
    // 立即刷新页面显示数据
    location.reload();
}

// 在 initAdmin 函数开始时调用
function initAdmin() {
    console.log('=== 初始化管理后台 ===');
    
    // 检查是否有数据，没有则创建测试数据
    const submissions = getAllSubmissions();
    if (submissions.length === 0) {
        console.log('⚠️ 没有找到数据，正在创建测试数据...');
        createInstantTestData();
        return; // 创建后会刷新页面
    }
    
    // ... 其他初始化代码 ...
}

// 在 admin.js 中添加更完整的数据标准化函数
function normalizeSubmission(sub) {
    const type = sub.type || 'consultation';
    const normalized = { ...sub };
    
    // 根据类型映射字段
    const fieldMappings = {
        'consultation': {
            'consult-name': 'name',
            'consult-position': 'position',
            'consult-company': 'company',
            'consult-industry': 'industry',
            'consult-email': 'email',
            'consult-phone': 'phone',
            'consult-service': 'service',
            'consult-needs': 'needs',
            'consult-time': 'time',
            'consult-newsletter': 'newsletter',
            'consult-terms': 'terms'
        },
        'wechat': {
            'wechat-name': 'name',
            'wechat-company': 'company',
            'wechat-position': 'position',
            'wechat-industry': 'industry',
            'wechat-purpose': 'purpose',
            'wechat-terms': 'terms'
        },
        'partnership': {
            'partner-name': 'name',
            'partner-position': 'position',
            'partner-company': 'company',
            'partner-type': 'type',
            'partner-email': 'email',
            'partner-phone': 'phone',
            'partner-website': 'website',
            'partner-cooperation': 'cooperation',
            'partner-description': 'description',
            'partner-expectation': 'expectation',
            'partner-terms': 'terms'
        },
        'other': {
            'other-name': 'name',
            'other-company': 'company',
            'other-email': 'email',
            'other-phone': 'phone',
            'other-category': 'category',
            'other-subject': 'subject',
            'other-content': 'content',
            'other-terms': 'terms'
        }
    };
    
    // 应用字段映射
    const mappings = fieldMappings[type] || {};
    Object.keys(mappings).forEach(oldKey => {
        if (normalized[oldKey] !== undefined) {
            normalized[mappings[oldKey]] = normalized[oldKey];
        }
    });
    
    return normalized;
}

// 添加一个辅助函数来获取字段值
function getSubmissionField(sub, field, type) {
    // 先尝试标准字段名
    if (sub[field] !== undefined) {
        return sub[field];
    }
    
    // 根据类型尝试带前缀的字段名
    const prefixes = {
        'consultation': 'consult',
        'wechat': 'wechat',
        'partnership': 'partner',
        'other': 'other'
    };
    
    const prefix = prefixes[type];
    if (prefix && sub[`${prefix}-${field}`] !== undefined) {
        return sub[`${prefix}-${field}`];
    }
    
    return null;
}

// 确保模态框可以正常关闭
function initModalEvents() {
    // 模态框关闭按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
}

// 在DOM加载完成后初始化事件
document.addEventListener('DOMContentLoaded', function() {
    // ... 其他初始化代码 ...
    
    // 初始化模态框事件
    initModalEvents();
    
    // ... 其他代码 ...
});

// 添加一些新的辅助函数
function getPurposeLabel(purpose) {
    const labels = {
        'resource': '获取行业资源与报告',
        'consult': '业务咨询与合作',
        'community': '加入行业交流群',
        'other': '其他'
    };
    return labels[purpose] || purpose;
}

function getCooperationLabel(cooperation) {
    const labels = {
        'supplier': '成为我们的供应商',
        'channel': '渠道合作伙伴',
        'joint': '联合解决方案开发',
        'expert': '加入专家网络',
        'other': '其他合作'
    };
    return labels[cooperation] || cooperation;
}

function getCategoryLabel(category) {
    const labels = {
        'product': '产品与方案咨询',
        'price': '服务报价与合同',
        'speech': '演讲与培训邀请',
        'media': '媒体合作',
        'career': '招聘与职业机会',
        'other': '其他'
    };
    return labels[category] || category;
}

function getCompanyTypeLabel(type) {
    const labels = {
        'software': '软件供应商',
        'hardware': '硬件供应商',
        'service': '服务提供商',
        'consulting': '咨询公司',
        'institution': '行业机构/协会',
        'other': '其他'
    };
    return labels[type] || type;
}

// 添加一个调试函数，测试详情查看功能
function testViewDetail() {
    const submissions = getAllSubmissions();
    
    if (submissions.length === 0) {
        console.log('没有数据可以测试');
        return;
    }
    
    const firstId = submissions[0].id;
    console.log('测试查看详情，ID:', firstId);
    viewDetail(firstId);
}

// 在控制台可以直接调用 testViewDetail() 来测试

// 改进的关闭模态框函数
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    // 不要设置 body 的 overflow，让页面正常滚动
    // document.body.style.overflow = 'auto';
}

// 初始化模态框事件
function initModalEvents() {
    // 模态框关闭按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeAllModals();
        });
    });
    
    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}