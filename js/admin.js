// 在admin.js文件的开头附近添加这个函数
function syncContactDataToMainStorage() {
    console.log('开始同步contact.js数据到主存储...');
    
    const contactData = localStorage.getItem('cement_contact_submissions');
    if (!contactData) {
        console.log('没有找到contact.js数据');
        return;
    }
    
    try {
        const parsedContactData = JSON.parse(contactData);
        const mainData = localStorage.getItem('cement_submissions');
        let mainParsed = [];
        
        if (mainData) {
            mainParsed = JSON.parse(mainData);
        }
        
        // 找出需要添加的数据（基于ID去重）
        const existingIds = new Set(mainParsed.map(item => item.id));
        const newItems = parsedContactData.filter(item => !existingIds.has(item.id));
        
        if (newItems.length > 0) {
            // 格式化新数据
            const formattedItems = newItems.map(item => {
                return {
                    id: item.id,
                    type: 'partnership',  // 明确设置类型
                    timestamp: item.timestamp || new Date().toISOString(),
                    status: item.status || 'pending',
                    // 保留所有原始字段
                    ...item
                };
            });
            
            // 合并数据
            const combinedData = [...mainParsed, ...formattedItems];
            localStorage.setItem('cement_submissions', JSON.stringify(combinedData));
            
            console.log(`成功同步了 ${newItems.length} 条合作洽谈数据`);
            return formattedItems.length;
        } else {
            console.log('没有新的合作洽谈数据需要同步');
            return 0;
        }
        
    } catch (error) {
        console.error('同步数据时出错:', error);
        return 0;
    }
}


// 管理后台主功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== admin.js 加载完成 ===');
    
    // 检查登录状态
    checkAuth();
    
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
    
    // 初始化模态框事件
    initModalEvents();
    
    // 初始化密码修改功能
    initPasswordChange();
    
    // 初始化删除功能
    initDeleteFunction();
    
    // 初始化编辑表单提交
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
    
    // 初始化设置复选框
    initSettingsCheckboxes();
    
    console.log('✅ 事件监听器已设置');
});

// 初始化模态框事件
function initModalEvents() {
    // 点击模态框外部关闭
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'block' || modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 检查认证状态
function checkAuth() {
    try {
        const authData = JSON.parse(localStorage.getItem('admin_auth') || 'null');
        
        if (authData) {
            // 检查是否过期（24小时）
            const hoursElapsed = (Date.now() - authData.timestamp) / (1000 * 60 * 60);
            
            if (hoursElapsed < 24 || authData.remember) {
                // 已登录，显示管理页面
                switchToDashboard(authData.username);
            } else {
                localStorage.removeItem('admin_auth');
            }
        }
    } catch (error) {
        console.error('检查登录状态时出错:', error);
        localStorage.removeItem('admin_auth');
    }
}

// 登录处理
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // 1. 验证用户名
    if (username !== 'admin') {
        showNotification('用户名错误，请使用 admin', 'error');
        return;
    }

    // 2. 获取存储的哈希
    const storedHash = localStorage.getItem('admin_password_hash');
    const defaultPassword = 'AnHuan2024';
    let isAuthenticated = false;

    // 3. 进行密码验证
    if (storedHash) {
        // 使用存储的哈希值比对
        const inputHash = CryptoJS.SHA256(password).toString();
        isAuthenticated = (inputHash === storedHash);
    } else {
        // 全新系统，使用默认密码验证
        isAuthenticated = (password === defaultPassword);
        // 首次登录成功，立即将默认密码哈希后存储
        if (isAuthenticated) {
            localStorage.setItem('admin_password_hash', CryptoJS.SHA256(defaultPassword).toString());
        }
    }

    // 4. 处理验证结果
    if (isAuthenticated) {
        const authData = {
            username: username,
            timestamp: Date.now(),
            remember: remember
        };
        localStorage.setItem('admin_auth', JSON.stringify(authData));
        showNotification('登录成功！', 'success');
        switchToDashboard(username);
    } else {
        let errorMsg = '密码错误';
        errorMsg += storedHash ? '，请使用您设置的新密码' : '，默认密码为 AnHuan2024';
        showNotification(errorMsg, 'error');
        document.getElementById('password').value = '';
    }
}

// 切换到管理页面
function switchToDashboard(username) {
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    
    if (!loginPage || !dashboardPage) {
        alert('页面加载错误，请刷新页面');
        return;
    }
    
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    
    const userSpan = document.getElementById('current-user');
    if (userSpan) {
        userSpan.textContent = username || '管理员';
    }
    
    setTimeout(() => {
        try {
            loadStats();
            loadRecentSubmissions();
            updateCounts();
            initSettingsCheckboxes();
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }, 100);
}

// 切换页面
function switchSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    const targetMenuItem = document.querySelector(`[href="#${sectionId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
    
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
        case 'export':
            loadExportSection();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'dashboard':
            loadStats();
            loadRecentSubmissions();
            break;
        default:
            document.getElementById('dashboard').classList.add('active');
            document.querySelector('[href="#dashboard"]').classList.add('active');
            loadStats();
            loadRecentSubmissions();
    }
}

// 加载统计数据
function loadStats() {
    const submissions = getAllSubmissions();
    
    document.getElementById('total-submissions').textContent = submissions.length;
    
    const today = new Date().toLocaleDateString();
    const todayCount = submissions.filter(s => 
        new Date(s.timestamp).toLocaleDateString() === today
    ).length;
    document.getElementById('today-submissions').textContent = todayCount;
    
    updateCounts();
    
    // 绘制图表
    drawCharts();
}

// 获取所有提交
function getAllSubmissions() {
    const data = localStorage.getItem('cement_submissions');
    if (!data) {
        return [];
    }
    
    let submissions = [];
    try {
        submissions = JSON.parse(data);
    } catch (e) {
        console.error('解析数据失败:', e);
        return [];
    }
    
    // 修复数据类型：将 'software'、'hardware' 等公司类型转换为 'partnership'
    submissions = submissions.map(sub => {
        if (!sub.type) {
            // 根据字段判断类型
            if (sub['partner-name'] || sub['partner-cooperation'] || sub.name) {
                sub.type = 'partnership';
            } else if (sub['consult-name'] || sub['consult-service']) {
                sub.type = 'consultation';
            } else if (sub['wechat-name'] || sub['wechat-purpose']) {
                sub.type = 'wechat';
            } else if (sub['other-name'] || sub['other-category']) {
                sub.type = 'other';
            } else {
                sub.type = 'other';
            }
        } else if (sub.type === 'software' || sub.type === 'hardware' || 
                   sub.type === 'service' || sub.type === 'consulting' || 
                   sub.type === 'institution') {
            // 这些是公司类型，不是咨询类型，应该转换为 'partnership'
            sub.type = 'partnership';
        }
        
        return sub;
    });
    
    return submissions.sort((a, b) => {
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
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    暂无最近提交数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const name = getSubmissionField(sub, 'name', sub.type) || '未知';
        const company = getSubmissionField(sub, 'company', sub.type) || '-';
        const type = sub.type || '未知';
        const status = sub.status || 'pending';
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${getTypeLabel(type)}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewDetail(${sub.id})">查看</button>
                <button class="btn btn-sm btn-secondary" onclick="editSubmission(${sub.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete(${sub.id}, '${getTypeLabel(type)}')">删除</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 绘制图表
let submissionChart = null;
let typeChart = null;

function drawCharts() {
    // 检查Chart是否已加载
    if (typeof Chart === 'undefined') {
        console.error('Chart.js 未加载，无法绘制图表');
        const submissionLoading = document.getElementById('submission-loading');
        const typeLoading = document.getElementById('type-loading');
        
        if (submissionLoading) {
            submissionLoading.textContent = '图表库加载失败，请刷新页面';
            submissionLoading.style.display = 'flex';
        }
        if (typeLoading) {
            typeLoading.textContent = '图表库加载失败，请刷新页面';
            typeLoading.style.display = 'flex';
        }
        return;
    }

    console.log('开始绘制图表...'); // 添加这行调试信息

    // 确保canvas元素存在
    const submissionCanvas = document.getElementById('submission-chart');
    const typeCanvas = document.getElementById('type-chart');
    
    if (!submissionCanvas || !typeCanvas) {
        console.error('图表canvas元素未找到');
        return;
    }
    
    // 获取数据
    const submissions = getAllSubmissions();
    console.log('获取到数据量:', submissions.length); // 添加这行调试信息
    
    if (submissions.length === 0) {
        // 没有数据，显示提示
        const submissionLoading = document.getElementById('submission-loading');
        const typeLoading = document.getElementById('type-loading');
        
        if (submissionLoading) {
            submissionLoading.textContent = '暂无数据，请点击"生成图表数据"按钮添加测试数据';
            submissionLoading.style.display = 'flex';
        }
        if (typeLoading) {
            typeLoading.textContent = '暂无数据，请点击"生成图表数据"按钮添加测试数据';
            typeLoading.style.display = 'flex';
        }
        return;
    }
    
    // 隐藏加载状态
    const submissionLoading = document.getElementById('submission-loading');
    const typeLoading = document.getElementById('type-loading');
    
    if (submissionLoading) submissionLoading.style.display = 'none';
    if (typeLoading) typeLoading.style.display = 'none';
    
    // 显示canvas
    submissionCanvas.style.display = 'block';
    typeCanvas.style.display = 'block';
    
    // 绘制图表
    try {
        drawSubmissionChart();
        drawTypeChart();
        console.log('图表绘制完成'); // 添加这行调试信息
    } catch (error) {
        console.error('绘制图表时出错:', error);
        // 显示错误信息
        if (submissionLoading) {
            submissionLoading.textContent = '图表绘制失败，请刷新页面重试';
            submissionLoading.style.display = 'flex';
        }
        if (typeLoading) {
            typeLoading.textContent = '图表绘制失败，请刷新页面重试';
            typeLoading.style.display = 'flex';
        }
    }
}

function drawSubmissionChart() {
    const canvas = document.getElementById('submission-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 如果之前有图表实例，销毁它
    if (submissionChart) {
        submissionChart.destroy();
    }
    
    // 获取最近30天的数据
    const submissions = getAllSubmissions();
    const last30Days = getLast30DaysData(submissions);
    
    submissionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last30Days.map(day => day.date),
            datasets: [{
                label: '每日提交量',
                data: last30Days.map(day => day.count),
                borderColor: 'rgba(42, 91, 158, 1)',
                backgroundColor: 'rgba(42, 91, 158, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '提交量'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日期'
                    }
                }
            }
        }
    });
}

function drawTypeChart() {
    const canvas = document.getElementById('type-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 如果之前有图表实例，销毁它
    if (typeChart) {
        typeChart.destroy();
    }
    
    const submissions = getAllSubmissions();
    const typeCounts = {
        consultation: 0,
        wechat: 0,
        partnership: 0,
        other: 0
    };
    
    submissions.forEach(sub => {
        const type = sub.type || 'consultation';
        if (typeCounts[type] !== undefined) {
            typeCounts[type]++;
        }
    });
    
    const labels = [];
    const data = [];
    const colors = [];
    
    if (typeCounts.consultation > 0) {
        labels.push('预约咨询');
        data.push(typeCounts.consultation);
        colors.push('rgba(42, 91, 158, 0.8)');
    }
    
    if (typeCounts.wechat > 0) {
        labels.push('微信咨询');
        data.push(typeCounts.wechat);
        colors.push('rgba(52, 152, 219, 0.8)');
    }
    
    if (typeCounts.partnership > 0) {
        labels.push('合作洽谈');
        data.push(typeCounts.partnership);
        colors.push('rgba(46, 204, 113, 0.8)');
    }
    
    if (typeCounts.other > 0) {
        labels.push('其他咨询');
        data.push(typeCounts.other);
        colors.push('rgba(155, 89, 182, 0.8)');
    }
    
    typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            cutout: '60%'
        }
    });
}

function getLast30DaysData(submissions) {
    const result = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDateShort(date);
        
        result.push({
            date: dateStr,
            count: 0
        });
    }
    
    submissions.forEach(sub => {
        if (!sub.timestamp) return;
        
        const subDate = new Date(sub.timestamp);
        const subDateStr = formatDateShort(subDate);
        
        const dayIndex = result.findIndex(day => day.date === subDateStr);
        if (dayIndex !== -1) {
            result[dayIndex].count++;
        }
    });
    
    return result;
}

function formatDateShort(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
}

// 加载预约咨询
function loadConsultations() {
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'consultation' || (!s.type && s['consult-name'])
    );
    
    const tbody = document.getElementById('consultation-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    暂无预约咨询数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = sub.type || 'consultation';
        
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const service = getSubmissionField(sub, 'service', type) || '-';
        const time = getSubmissionField(sub, 'time', type) || '-';
        const recordId = sub.id || Date.now() + index;
        
        const row = document.createElement('tr');
        row.dataset.id = recordId;
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" onchange="updateRowSelection(this); updateBatchToolbar()"></td>
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
                <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '${getTypeLabel(type)}')" title="删除此记录">
                    <span>🗑️</span> 删除
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updateBatchToolbar();
}

// 加载微信咨询数据
function loadWechatSubmissions() {
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'wechat' || (s['wechat-name'] && !s.type)
    );
    
    const tbody = document.getElementById('wechat-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    暂无微信咨询数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = 'wechat';
        
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const industry = getSubmissionField(sub, 'industry', type) || '-';
        const purpose = getSubmissionField(sub, 'purpose', type) || '-';
        const recordId = sub.id || Date.now() + index;
        
        const row = document.createElement('tr');
        row.dataset.id = recordId;
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" onchange="updateRowSelection(this); updateWechatBatchToolbar()"></td>
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${position}</td>
            <td>${getIndustryLabel(industry)}</td>
            <td>${getPurposeLabel(purpose)}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '微信咨询')" title="删除此记录">
                    <span>🗑️</span> 删除
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updateWechatBatchToolbar();
}

function updateRowSelection(checkbox) {
    const row = checkbox.closest('tr');
    if (!row) return;
    
    if (checkbox.checked) {
        row.classList.add('selected-row');
        row.dataset.selected = 'true';
    } else {
        row.classList.remove('selected-row');
        row.dataset.selected = 'false';
    }
}

// 加载合作洽谈数据
function loadPartnershipSubmissions() {
    const submissions = getAllSubmissions().filter(s => {
        // 扩展过滤条件
        const type = s.type || '';
        return type === 'partnership' || 
               type === 'software' ||      // 旧的公司类型
               type === 'hardware' || 
               type === 'service' || 
               type === 'consulting' || 
               type === 'institution' ||
               (s['partner-name'] && !s.type) ||
               (s['partner-cooperation'] && !s.type);
    });
    
    const tbody = document.getElementById('partnership-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    暂无合作洽谈数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = 'partnership';
        
        // 尝试多种字段名
        const name = getSubmissionField(sub, 'name', type) || 
                     sub['partner-name'] || 
                     sub['partner-contact'] || 
                     '-';
        
        const company = getSubmissionField(sub, 'company', type) || 
                        sub['partner-company'] || 
                        '-';
        
        const position = getSubmissionField(sub, 'position', type) || 
                         sub['partner-position'] || 
                         '-';
        
        const companyType = getSubmissionField(sub, 'type', type) || 
                            sub['partner-type'] || 
                            '-';
        
        const cooperation = getSubmissionField(sub, 'cooperation', type) || 
                            sub['partner-cooperation'] || 
                            '-';
        
        const recordId = sub.id || Date.now() + index;
        
        const row = document.createElement('tr');
        row.dataset.id = recordId;
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" onchange="updateRowSelection(this); updatePartnershipBatchToolbar()"></td>
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${position}</td>
            <td>${getCompanyTypeLabel(companyType)}</td>
            <td>${getCooperationLabel(cooperation)}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '合作洽谈')" title="删除此记录">
                    <span>🗑️</span> 删除
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updatePartnershipBatchToolbar();
}

// 加载其他咨询数据
function loadOtherSubmissions() {
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'other' || (s['other-name'] && !s.type)
    );
    
    const tbody = document.getElementById('other-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    暂无其他咨询数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = 'other';
        
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const category = getSubmissionField(sub, 'category', type) || '-';
        const subject = getSubmissionField(sub, 'subject', type) || '-';
        const recordId = sub.id || Date.now() + index;
        
        const row = document.createElement('tr');
        row.dataset.id = recordId;
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" onchange="updateRowSelection(this); updateOtherBatchToolbar()"></td>
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${getCategoryLabel(category)}</td>
            <td>${subject}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '其他咨询')" title="删除此记录">
                    <span>🗑️</span> 删除
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updateOtherBatchToolbar();
}

// 加载系统设置页面
function loadSettings() {
    console.log('加载系统设置页面');
    
    // 更新数据统计
    const submissions = getAllSubmissions();
    const totalData = submissions.length;
    const storageSize = calculateStorageSize(submissions);
    const lastBackup = localStorage.getItem('last_backup_time') || '从未备份';
    
    document.getElementById('settings-total-data').textContent = totalData;
    document.getElementById('settings-storage-size').textContent = storageSize;
    document.getElementById('settings-last-backup').textContent = lastBackup;
    
    // 加载保存的设置
    loadSavedSettings();
}

function calculateStorageSize(submissions) {
    const jsonString = JSON.stringify(submissions);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

function loadSavedSettings() {
    // 加载通知设置
    const emailNotification = localStorage.getItem('email_notification') !== 'false';
    const wechatNotification = localStorage.getItem('wechat_notification') === 'true';
    const smsNotification = localStorage.getItem('sms_notification') === 'true';
    
    const emailCheckbox = document.getElementById('email-notification');
    const wechatCheckbox = document.getElementById('wechat-notification');
    const smsCheckbox = document.getElementById('sms-notification');
    
    if (emailCheckbox) emailCheckbox.checked = emailNotification;
    if (wechatCheckbox) wechatCheckbox.checked = wechatNotification;
    if (smsCheckbox) smsCheckbox.checked = smsNotification;
    
    // 加载登录安全设置
    const loginNotification = localStorage.getItem('login_notification') !== 'false';
    const loginIpCheck = localStorage.getItem('login_ip_check') === 'true';
    const loginTwoFactor = localStorage.getItem('login_two_factor') === 'true';
    
    const loginNotifCheckbox = document.getElementById('login-notification');
    const loginIpCheckbox = document.getElementById('login-ip-check');
    const loginTwoFactorCheckbox = document.getElementById('login-two-factor');
    
    if (loginNotifCheckbox) loginNotifCheckbox.checked = loginNotification;
    if (loginIpCheckbox) loginIpCheckbox.checked = loginIpCheck;
    if (loginTwoFactorCheckbox) loginTwoFactorCheckbox.checked = loginTwoFactor;
    
    // 加载页面大小设置
    const pageSize = localStorage.getItem('page_size') || '10';
    const pageSizeSelect = document.getElementById('page-size');
    if (pageSizeSelect) pageSizeSelect.value = pageSize;
    
    // 加载主题设置
    const themeColor = localStorage.getItem('theme_color') || 'blue';
    const themeColorSelect = document.getElementById('theme-color');
    if (themeColorSelect) themeColorSelect.value = themeColor;
}

function initSettingsCheckboxes() {
    // 绑定设置复选框事件
    const emailCheckbox = document.getElementById('email-notification');
    const wechatCheckbox = document.getElementById('wechat-notification');
    const smsCheckbox = document.getElementById('sms-notification');
    
    if (emailCheckbox) {
        emailCheckbox.addEventListener('change', function() {
            localStorage.setItem('email_notification', this.checked);
        });
    }
    
    if (wechatCheckbox) {
        wechatCheckbox.addEventListener('change', function() {
            localStorage.setItem('wechat_notification', this.checked);
        });
    }
    
    if (smsCheckbox) {
        smsCheckbox.addEventListener('change', function() {
            localStorage.setItem('sms_notification', this.checked);
        });
    }
    
    // 绑定登录安全设置
    const loginNotifCheckbox = document.getElementById('login-notification');
    const loginIpCheckbox = document.getElementById('login-ip-check');
    const loginTwoFactorCheckbox = document.getElementById('login-two-factor');
    
    if (loginNotifCheckbox) {
        loginNotifCheckbox.addEventListener('change', function() {
            localStorage.setItem('login_notification', this.checked);
        });
    }
    
    if (loginIpCheckbox) {
        loginIpCheckbox.addEventListener('change', function() {
            localStorage.setItem('login_ip_check', this.checked);
        });
    }
    
    if (loginTwoFactorCheckbox) {
        loginTwoFactorCheckbox.addEventListener('change', function() {
            localStorage.setItem('login_two_factor', this.checked);
        });
    }
    
    // 绑定页面大小设置
    const pageSizeSelect = document.getElementById('page-size');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function() {
            localStorage.setItem('page_size', this.value);
        });
    }
    
    // 绑定主题设置
    const themeColorSelect = document.getElementById('theme-color');
    if (themeColorSelect) {
        themeColorSelect.addEventListener('change', function() {
            localStorage.setItem('theme_color', this.value);
        });
    }
}

function backupData() {
    const submissions = getAllSubmissions();
    const backupData = {
        timestamp: new Date().toISOString(),
        data: submissions,
        count: submissions.length
    };
    
    const backupKey = 'data_backup_' + Date.now();
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    localStorage.setItem('last_backup_time', new Date().toLocaleString());
    
    showNotification('数据备份成功！', 'success');
    loadSettings();
}

function showBackupHistory() {
    // 获取所有备份
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('data_backup_')) {
            try {
                const backupData = JSON.parse(localStorage.getItem(key));
                backups.push({
                    key: key,
                    timestamp: new Date(backupData.timestamp).toLocaleString(),
                    name: `备份_${new Date(backupData.timestamp).toLocaleDateString()}`,
                    count: backupData.count || 0,
                    size: calculateStorageSize(backupData.data || [])
                });
            } catch (error) {
                console.error('解析备份数据失败:', error);
            }
        }
    }
    
    // 按时间倒序排序
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const tbody = document.getElementById('backup-history-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (backups.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                    暂无备份记录
                </td>
            </tr>
        `;
    } else {
        backups.forEach(backup => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${backup.timestamp}</td>
                <td>${backup.name}</td>
                <td>${backup.count} 条</td>
                <td>${backup.size}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="restoreBackup('${backup.key}')">
                        恢复
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBackup('${backup.key}')">
                        删除
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    const modal = document.getElementById('backup-history-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function restoreBackup(backupKey) {
    if (!confirm('确定要恢复此备份吗？当前数据将被覆盖。')) {
        return;
    }
    
    const backupData = JSON.parse(localStorage.getItem(backupKey));
    if (!backupData || !backupData.data) {
        showNotification('备份数据无效', 'error');
        return;
    }
    
    localStorage.setItem('cement_submissions', JSON.stringify(backupData.data));
    
    showNotification(`已恢复备份，共 ${backupData.count} 条数据`, 'success');
    
    // 刷新当前页面
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        switchSection(sectionId);
    }
    
    closeModal('backup-history-modal');
}

function deleteBackup(backupKey) {
    if (!confirm('确定要删除此备份吗？此操作不可撤销。')) {
        return;
    }
    
    localStorage.removeItem(backupKey);
    showNotification('备份已删除', 'success');
    
    // 刷新备份历史列表
    showBackupHistory();
}

function cleanOldData() {
    const confirmDelete = confirm('确定要清理30天前的数据吗？此操作不可撤销！');
    if (!confirmDelete) return;
    
    const submissions = getAllSubmissions();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredSubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.timestamp);
        return subDate >= thirtyDaysAgo;
    });
    
    localStorage.setItem('cement_submissions', JSON.stringify(filteredSubmissions));
    
    showNotification(`已清理 ${submissions.length - filteredSubmissions.length} 条30天前的数据`, 'success');
    
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadStats();
        loadRecentSubmissions();
    }
    loadSettings();
}

function cleanAllTestData() {
    const confirmDelete = confirm('确定要清理所有测试数据吗？此操作不可撤销！');
    if (!confirmDelete) return;
    
    localStorage.setItem('cement_submissions', JSON.stringify([]));
    
    showNotification('已清理所有测试数据', 'success');
    
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadStats();
        loadRecentSubmissions();
    }
    loadSettings();
}

// 辅助函数
function getSubmissionField(sub, field, type) {
    if (sub[field] !== undefined) {
        return sub[field];
    }
    
    const prefixes = {
        'consultation': 'consult',
        'wechat': 'wechat',
        'partnership': 'partner',
        'other': 'other'
    };
    
    const prefix = prefixes[type];
    const prefixedField = prefix ? `${prefix}-${field}` : null;
    
    if (prefixedField && sub[prefixedField] !== undefined) {
        return sub[prefixedField];
    }
    
    return null;
}

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

// 登出
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('admin_auth');
        location.reload();
    }
}

// 查看详情
function viewDetail(id) {
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
        showNotification('未找到该记录', 'error');
        return;
    }
    
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');
    
    if (!modal || !content) {
        showNotification('页面元素加载失败，请刷新页面', 'error');
        return;
    }
    
    content.innerHTML = buildDetailContent(submission);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function buildDetailContent(submission) {
    const type = submission.type || 'consultation';
    const name = getSubmissionField(submission, 'name', type) || '未知';
    const company = getSubmissionField(submission, 'company', type) || '-';
    const email = getSubmissionField(submission, 'email', type) || '-';
    const phone = getSubmissionField(submission, 'phone', type) || '-';
    const position = getSubmissionField(submission, 'position', type) || '-';
    const industry = getSubmissionField(submission, 'industry', type) || '-';
    const timestamp = submission.timestamp || '-';
    const status = submission.status || 'pending';
    
    let html = `
        <div class="detail-container">
            <h2 class="detail-title">提交详情</h2>
            
            <div class="detail-card">
                <h3>基本信息</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">记录ID：</span>
                        <span class="detail-value">${submission.id || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">提交时间：</span>
                        <span class="detail-value">${timestamp}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">咨询类型：</span>
                        <span class="detail-value">${getTypeLabel(type)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">状态：</span>
                        <span class="detail-value">
                            <span class="status-badge status-${status}">
                                ${getStatusLabel(status)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>联系人信息</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">姓名：</span>
                        <span class="detail-value"><strong>${escapeHtml(name)}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">职位：</span>
                        <span class="detail-value">${escapeHtml(position)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">公司：</span>
                        <span class="detail-value">${escapeHtml(company)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">行业：</span>
                        <span class="detail-value">${getIndustryLabel(industry)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">邮箱：</span>
                        <span class="detail-value">
                            <a href="mailto:${email}" style="color: var(--primary-color); text-decoration: none;">
                                ${escapeHtml(email)}
                            </a>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">手机：</span>
                        <span class="detail-value">
                            <a href="tel:${phone}" style="color: var(--primary-color); text-decoration: none;">
                                ${escapeHtml(phone)}
                            </a>
                        </span>
                    </div>
                </div>
            </div>
    `;
    
    if (type === 'consultation') {
        const service = getSubmissionField(submission, 'service', type) || '-';
        const time = getSubmissionField(submission, 'time', type) || '-';
        const needs = getSubmissionField(submission, 'needs', type);
        const newsletter = getSubmissionField(submission, 'newsletter', type);
        
        html += `
            <div class="detail-card">
                <h3>咨询详情</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">感兴趣服务：</span>
                        <span class="detail-value">${getServiceLabel(service)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">期望时间：</span>
                        <span class="detail-value">${getTimeLabel(time)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">订阅资讯：</span>
                        <span class="detail-value">${newsletter ? '是' : '否'}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (needs && needs.trim() !== '') {
            html += `
                <div class="detail-card">
                    <h3>需求描述</h3>
                    <div class="detail-text">
                        <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(needs)}
                        </pre>
                    </div>
                </div>
            `;
        }
    }
    
    if (submission.notes) {
        html += `
            <div class="detail-card">
                <h3>处理备注</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(submission.notes)}
                    </pre>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 编辑提交
function editSubmission(id) {
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
        showNotification('未找到该记录', 'error');
        return;
    }
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-type').value = submission.type || 'consultation';
    document.getElementById('edit-status').value = submission.status || 'pending';
    document.getElementById('edit-notes').value = submission.notes || '';
    
    if (submission.followup) {
        const followupDate = new Date(submission.followup);
        document.getElementById('edit-followup').value = followupDate.toISOString().slice(0, 16);
    } else {
        document.getElementById('edit-followup').value = '';
    }
    
    document.getElementById('edit-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const type = document.getElementById('edit-type').value;
    const status = document.getElementById('edit-status').value;
    const notes = document.getElementById('edit-notes').value;
    const followup = document.getElementById('edit-followup').value;
    
    const submissions = getAllSubmissions();
    const submissionIndex = submissions.findIndex(s => s.id == id);
    
    if (submissionIndex === -1) {
        showNotification('未找到该记录', 'error');
        return;
    }
    
    // 更新数据
    submissions[submissionIndex].status = status;
    submissions[submissionIndex].notes = notes;
    
    if (followup) {
        submissions[submissionIndex].followup = followup;
    } else {
        delete submissions[submissionIndex].followup;
    }
    
    // 保存到localStorage
    localStorage.setItem('cement_submissions', JSON.stringify(submissions));
    
    showNotification('记录已更新', 'success');
    closeModal('edit-modal');
    
    // 刷新当前页面
    refreshCurrentPage();
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// 添加通知样式
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    }
    
    .notification-info {
        background: #2196F3;
    }
    
    .notification-success {
        background: #4CAF50;
    }
    
    .notification-error {
        background: #f44336;
    }
    
    .notification-warning {
        background: #FF9800;
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// 创建综合测试数据
function createComprehensiveTestData() {
    console.log('=== 创建综合测试数据 ===');
    
    const testData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dailyCount = Math.floor(Math.random() * 6);
        
        for (let j = 0; j < dailyCount; j++) {
            const types = ['consultation', 'wechat', 'partnership', 'other'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            const randomHour = Math.floor(Math.random() * 24);
            const randomMinute = Math.floor(Math.random() * 60);
            const submissionDate = new Date(date);
            submissionDate.setHours(randomHour, randomMinute, 0);
            
            const record = {
                id: Date.now() + testData.length,
                type: randomType,
                timestamp: submissionDate.toISOString(),
                status: Math.random() > 0.7 ? 'contacted' : 'pending',
                notes: Math.random() > 0.8 ? '测试备注：已初步联系，待进一步跟进' : ''
            };
            
            switch(randomType) {
                case 'consultation':
                    record['consult-name'] = `测试用户${testData.length + 1}`;
                    record['consult-position'] = '安全经理';
                    record['consult-company'] = `测试水泥厂${Math.floor(Math.random() * 10) + 1}`;
                    record['consult-industry'] = 'cement';
                    record['consult-service'] = 'diagnosis';
                    record['consult-time'] = 'afternoon';
                    record['consult-email'] = `test${testData.length + 1}@example.com`;
                    record['consult-phone'] = `13800${Math.floor(100000 + Math.random() * 900000)}`;
                    record['consult-needs'] = '需要数字化诊断服务，希望了解具体实施方案和预算。';
                    break;
                case 'wechat':
                    record['wechat-name'] = `微信用户${testData.length + 1}`;
                    record['wechat-position'] = '技术主管';
                    record['wechat-company'] = `测试商混站${Math.floor(Math.random() * 10) + 1}`;
                    record['wechat-industry'] = 'concrete';
                    record['wechat-purpose'] = 'resource';
                    record['wechat-email'] = `wechat${testData.length + 1}@example.com`;
                    record['wechat-phone'] = `13900${Math.floor(100000 + Math.random() * 900000)}`;
                    break;
                case 'partnership':
                    record['partner-name'] = `合作伙伴${testData.length + 1}`;
                    record['partner-position'] = '销售总监';
                    record['partner-company'] = `软件公司${Math.floor(Math.random() * 10) + 1}`;
                    record['partner-type'] = 'software';
                    record['partner-cooperation'] = 'supplier';
                    record['partner-email'] = `partner${testData.length + 1}@example.com`;
                    record['partner-phone'] = `13600${Math.floor(100000 + Math.random() * 900000)}`;
                    break;
                case 'other':
                    record['other-name'] = `咨询用户${testData.length + 1}`;
                    record['other-company'] = `咨询公司${Math.floor(Math.random() * 10) + 1}`;
                    record['other-category'] = 'product';
                    record['other-subject'] = '产品咨询';
                    record['other-email'] = `other${testData.length + 1}@example.com`;
                    record['other-phone'] = `13500${Math.floor(100000 + Math.random() * 900000)}`;
                    record['other-content'] = '需要了解贵公司产品的详细技术参数和价格信息。';
                    break;
            }
            
            testData.push(record);
        }
    }
    
    let existingData = [];
    try {
        const stored = localStorage.getItem('cement_submissions');
        if (stored) {
            existingData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('解析现有数据失败:', error);
    }
    
    const combinedData = [...testData, ...existingData];
    
    try {
        localStorage.setItem('cement_submissions', JSON.stringify(combinedData));
        console.log(`✅ 综合测试数据已创建，总数据量: ${combinedData.length}`);
        
        showNotification('综合测试数据已创建，包含最近30天的随机数据', 'success');
        
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadStats();
            loadRecentSubmissions();
            updateCounts();
        } else if (document.getElementById('wechat').classList.contains('active')) {
            loadWechatSubmissions();
        } else if (document.getElementById('partnership').classList.contains('active')) {
            loadPartnershipSubmissions();
        } else if (document.getElementById('other').classList.contains('active')) {
            loadOtherSubmissions();
        } else if (document.getElementById('consultations').classList.contains('active')) {
            loadConsultations();
        }
        
    } catch (error) {
        console.error('保存测试数据失败:', error);
        showNotification('创建测试数据失败', 'error');
    }

    try {
        localStorage.setItem('cement_submissions', JSON.stringify(combinedData));
        console.log(`✅ 综合测试数据已创建，总数据量: ${combinedData.length}`);
        
        showNotification('综合测试数据已创建，包含最近30天的随机数据', 'success');
        
        // 强制刷新图表数据
        setTimeout(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                loadStats();
                loadRecentSubmissions();
                updateCounts();
                // 重新绘制图表
                drawCharts();
            }
        }, 500);
        
    } catch (error) {
        console.error('保存测试数据失败:', error);
        showNotification('创建测试数据失败', 'error');
    }
}

// 修复数据中的类型字段
function fixDataTypes() {
    const submissions = getAllSubmissions();
    let fixedCount = 0;
    
    const fixedSubmissions = submissions.map(sub => {
        const originalType = sub.type;
        
        const validTypes = ['consultation', 'wechat', 'partnership', 'other'];
        
        if (!validTypes.includes(originalType)) {
            let newType = 'other';
            
            if (originalType === 'hardware' || originalType === 'software' || 
                originalType === 'service' || originalType === 'consulting' ||
                originalType === 'institution') {
                newType = 'partnership';
            } else if (sub['consult-name'] || sub['consult-service']) {
                newType = 'consultation';
            } else if (sub['wechat-name'] || sub['wechat-purpose']) {
                newType = 'wechat';
            } else if (sub['partner-name'] || sub['partner-cooperation']) {
                newType = 'partnership';
            } else if (sub['other-name'] || sub['other-category']) {
                newType = 'other';
            }
            
            console.log(`修复类型: ${originalType} -> ${newType}`);
            sub.type = newType;
            fixedCount++;
        }
        
        return sub;
    });
    
    if (fixedCount > 0) {
        localStorage.setItem('cement_submissions', JSON.stringify(fixedSubmissions));
        console.log(`✅ 修复了 ${fixedCount} 条数据的类型字段`);
        showNotification(`已修复 ${fixedCount} 条数据的类型字段`, 'success');
        return true;
    } else {
        console.log('✅ 数据类型正常，无需修复');
        showNotification('数据类型正常，无需修复', 'info');
        return false;
    }
}

// ==================== 密码修改功能 ====================
function initPasswordChange() {
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
        
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', checkPasswordStrength);
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        }
    }
}

function openChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const form = document.getElementById('change-password-form');
        if (form) form.reset();
        
        resetPasswordHints();
        
        setTimeout(() => {
            const currentPassInput = document.getElementById('current-password');
            if (currentPassInput) currentPassInput.focus();
        }, 100);
    }
}

function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPass = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    if (!currentPass || !newPass || !confirmPass) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        showNotification('两次输入的新密码不一致', 'error');
        return;
    }
    if (newPass.length < 6) {
        showNotification('新密码长度至少为6位', 'error');
        return;
    }

    const storedHash = localStorage.getItem('admin_password_hash');
    const defaultPassword = 'AnHuan2024';
    let isCurrentPasswordValid = false;

    if (storedHash) {
        const inputHash = CryptoJS.SHA256(currentPass).toString();
        isCurrentPasswordValid = (inputHash === storedHash);
    } else {
        isCurrentPasswordValid = (currentPass === defaultPassword);
    }

    if (!isCurrentPasswordValid) {
        showNotification('当前密码输入错误', 'error');
        return;
    }

    const newPasswordHash = CryptoJS.SHA256(newPass).toString();
    localStorage.setItem('admin_password_hash', newPasswordHash);
    
    console.log('✅ 新密码已使用SHA256哈希安全存储');

    showNotification('密码修改成功！请重新登录。', 'success');
    closeModal('change-password-modal');

    setTimeout(() => {
        if (confirm('密码已成功修改。为保障账户安全，建议立即重新登录。是否现在登出？')) {
            handleLogout();
        }
    }, 1000);
}

function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthBar = document.querySelector('.strength-bar');
    const segments = document.querySelectorAll('.strength-segment');
    const strengthLabel = document.getElementById('strength-label');
    
    if (!password) {
        segments.forEach(seg => {
            seg.style.backgroundColor = '#e9ecef';
        });
        if (strengthLabel) strengthLabel.textContent = '无';
        if (strengthLabel) strengthLabel.style.color = '#6c757d';
        return;
    }
    
    let strength = 0;
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    segments.forEach((seg, index) => {
        if (index < strength) {
            if (strength <= 2) {
                seg.style.backgroundColor = '#dc3545';
            } else if (strength <= 4) {
                seg.style.backgroundColor = '#ffc107';
            } else {
                seg.style.backgroundColor = '#28a745';
            }
        } else {
            seg.style.backgroundColor = '#e9ecef';
        }
    });
    
    if (strengthLabel) {
        if (strength <= 2) {
            strengthLabel.textContent = '弱';
            strengthLabel.style.color = '#dc3545';
        } else if (strength <= 4) {
            strengthLabel.textContent = '中';
            strengthLabel.style.color = '#ffc107';
        } else {
            strengthLabel.textContent = '强';
            strengthLabel.style.color = '#28a745';
        }
    }
}

function checkPasswordMatch() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const hintElement = document.getElementById('password-match-hint');
    
    if (!hintElement) return;
    
    if (!newPassword || !confirmPassword) {
        hintElement.textContent = '';
        hintElement.style.color = '';
        return;
    }
    
    if (newPassword === confirmPassword) {
        hintElement.textContent = '✅ 密码匹配';
        hintElement.style.color = '#28a745';
    } else {
        hintElement.textContent = '❌ 密码不匹配';
        hintElement.style.color = '#dc3545';
    }
}

function resetPasswordHints() {
    const strengthLabel = document.getElementById('strength-label');
    const segments = document.querySelectorAll('.strength-segment');
    const matchHint = document.getElementById('password-match-hint');
    
    if (strengthLabel) {
        strengthLabel.textContent = '弱';
        strengthLabel.style.color = '#dc3545';
    }
    
    segments.forEach(seg => {
        seg.style.backgroundColor = '#e9ecef';
    });
    
    if (matchHint) {
        matchHint.textContent = '';
        matchHint.style.color = '';
    }
}

// ==================== 刷新当前页面 ====================
function refreshCurrentPage() {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) {
        return;
    }
    
    const sectionId = activeSection.id;
    
    switch(sectionId) {
        case 'dashboard':
            loadStats();
            loadRecentSubmissions();
            break;
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
        case 'export':
            loadExportSection();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            loadStats();
            loadRecentSubmissions();
    }
    
    updateCounts();
    
    const toolbar = document.getElementById('batch-toolbar');
    if (toolbar) {
        toolbar.style.display = 'none';
    }
    
    showNotification('页面已刷新', 'success');
}

// ==================== 批量操作功能 ====================
function toggleSelectAll(checkbox) {
    const table = checkbox.closest('table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"].row-checkbox');
    const isChecked = checkbox.checked;
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        // 更新每一行的选中状态
        updateRowSelection(cb);
    });
    
    updateBatchToolbar();
}

function toggleSelectAllWechat(checkbox) {
    const table = checkbox.closest('table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"].row-checkbox');
    const isChecked = checkbox.checked;
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        // 更新每一行的选中状态
        updateRowSelection(cb);
    });
    
    updateWechatBatchToolbar();
}

function toggleSelectAllPartnership(checkbox) {
    const table = checkbox.closest('table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"].row-checkbox');
    const isChecked = checkbox.checked;
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        // 更新每一行的选中状态
        updateRowSelection(cb);
    });
    
    updatePartnershipBatchToolbar();
}

function toggleSelectAllOther(checkbox) {
    const table = checkbox.closest('table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"].row-checkbox');
    const isChecked = checkbox.checked;
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        // 更新每一行的选中状态
        updateRowSelection(cb);
    });
    
    updateOtherBatchToolbar();
}

function updateBatchToolbar() {
    const table = document.getElementById('consultation-table-body');
    if (!table) return;
    
    const checkedBoxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    const checkedCount = checkedBoxes.length;
    
    const toolbar = document.getElementById('batch-toolbar');
    const countElement = document.getElementById('selected-count');
    
    if (!toolbar || !countElement) return;
    
    if (checkedCount > 0) {
        countElement.textContent = checkedCount;
        toolbar.style.display = 'flex';
    } else {
        toolbar.style.display = 'none';
    }
}

function updateWechatBatchToolbar() {
    const table = document.getElementById('wechat-table-body');
    if (!table) return;
    
    const checkedBoxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    const checkedCount = checkedBoxes.length;
    
    const toolbar = document.getElementById('batch-toolbar-wechat');
    const countElement = document.getElementById('selected-wechat-count');
    
    if (!toolbar || !countElement) return;
    
    if (checkedCount > 0) {
        countElement.textContent = checkedCount;
        toolbar.style.display = 'flex';
    } else {
        toolbar.style.display = 'none';
    }
}

function updatePartnershipBatchToolbar() {
    const table = document.getElementById('partnership-table-body');
    if (!table) return;
    
    const checkedBoxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    const checkedCount = checkedBoxes.length;
    
    const toolbar = document.getElementById('batch-toolbar-partnership');
    const countElement = document.getElementById('selected-partnership-count');
    
    if (!toolbar || !countElement) return;
    
    if (checkedCount > 0) {
        countElement.textContent = checkedCount;
        toolbar.style.display = 'flex';
    } else {
        toolbar.style.display = 'none';
    }
}

function updateOtherBatchToolbar() {
    const table = document.getElementById('other-table-body');
    if (!table) return;
    
    const checkedBoxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    const checkedCount = checkedBoxes.length;
    
    const toolbar = document.getElementById('batch-toolbar-other');
    const countElement = document.getElementById('selected-other-count');
    
    if (!toolbar || !countElement) return;
    
    if (checkedCount > 0) {
        countElement.textContent = checkedCount;
        toolbar.style.display = 'flex';
    } else {
        toolbar.style.display = 'none';
    }
}

function clearSelection() {
    const table = document.getElementById('consultation-table-body');
    if (!table) return;
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
        updateRowSelection(cb);  // 移除行的选中样式
    });
    
    const headerCheckbox = document.getElementById('select-all-consultations');
    if (headerCheckbox) {
        headerCheckbox.checked = false;
    }
    
    document.getElementById('batch-toolbar').style.display = 'none';
}

function clearWechatSelection() {
    const table = document.getElementById('wechat-table-body');
    if (!table) return;
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
        updateRowSelection(cb);  // 移除行的选中样式
    });
    
    const headerCheckbox = document.getElementById('select-all-wechat');
    if (headerCheckbox) {
        headerCheckbox.checked = false;
    }
    
    document.getElementById('batch-toolbar-wechat').style.display = 'none';
}

function clearPartnershipSelection() {
    const table = document.getElementById('partnership-table-body');
    if (!table) return;
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
        updateRowSelection(cb);  // 移除行的选中样式
    });
    
    const headerCheckbox = document.getElementById('select-all-partnership');
    if (headerCheckbox) {
        headerCheckbox.checked = false;
    }
    
    document.getElementById('batch-toolbar-partnership').style.display = 'none';
}

function clearOtherSelection() {
    const table = document.getElementById('other-table-body');
    if (!table) return;
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
        updateRowSelection(cb);  // 移除行的选中样式
    });
    
    const headerCheckbox = document.getElementById('select-all-other');
    if (headerCheckbox) {
        headerCheckbox.checked = false;
    }
    
    document.getElementById('batch-toolbar-other').style.display = 'none';
}

// ==================== 删除功能 ====================
let deleteQueue = {
    type: '',
    ids: [],
    records: [],
    isBatch: false
};

let lastDeletedRecords = [];
const UNDO_TIMEOUT = 10000;

function initDeleteFunction() {
    console.log('初始化删除功能...');
}

function confirmDelete(id, typeName) {
    const submissions = getAllSubmissions();
    const recordId = id ? id.toString() : '';
    const record = submissions.find(s => s.id && s.id.toString() === recordId);
    
    if (!record) {
        showNotification('未找到要删除的记录', 'error');
        return;
    }
    
    deleteQueue = {
        type: record.type || 'consultation',
        ids: [recordId],
        records: [record],
        isBatch: false
    };
    
    const recordName = getSubmissionField(record, 'name', record.type) || '未知用户';
    const recordCompany = getSubmissionField(record, 'company', record.type) || '未知公司';
    
    document.getElementById('delete-title').textContent = '确认删除记录';
    document.getElementById('delete-message').innerHTML = `
        <p>您确定要删除以下记录吗？</p>
        <div class="record-preview">
            <strong>${recordName}</strong> - ${recordCompany}<br>
            <small>类型：${getTypeLabel(record.type || 'consultation')}</small><br>
            <small>时间：${formatDate(record.timestamp)}</small>
        </div>
    `;
    
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function batchDeleteConfirm() {
    const table = document.getElementById('consultation-table-body');
    if (!table) {
        showNotification('表格数据未加载，请刷新页面', 'error');
        return;
    }
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showNotification('请先选择要删除的记录', 'error');
        return;
    }
    
    const submissions = getAllSubmissions();
    const idsToDelete = [];
    const recordsToDelete = [];
    
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const recordId = row.dataset.id;
        if (recordId) {
            const recordIdStr = recordId.toString();
            const record = submissions.find(s => s.id && s.id.toString() === recordIdStr);
            if (record) {
                idsToDelete.push(recordIdStr);
                recordsToDelete.push(record);
            }
        }
    });
    
    if (idsToDelete.length === 0) {
        showNotification('未找到选中的有效记录', 'error');
        return;
    }
    
    deleteQueue = {
        type: 'consultation',
        ids: idsToDelete,
        records: recordsToDelete,
        isBatch: true
    };
    
    document.getElementById('delete-title').textContent = `确认删除 ${idsToDelete.length} 条记录`;
    document.getElementById('delete-message').innerHTML = `
        <p>您确定要删除选中的 <strong>${idsToDelete.length}</strong> 条记录吗？</p>
        <div class="records-preview">
            ${recordsToDelete.slice(0, 3).map(record => `
                <div class="record-item" style="padding: 5px 0; border-bottom: 1px solid #eee;">
                    <strong>${getSubmissionField(record, 'name', record.type) || '未知用户'}</strong>
                    - ${getSubmissionField(record, 'company', record.type) || '未知公司'}
                    <small style="color: #666;">(${getTypeLabel(record.type || 'consultation')})</small>
                </div>
            `).join('')}
            ${recordsToDelete.length > 3 ? `<p style="margin-top: 10px; color: #666;">... 以及另外 ${recordsToDelete.length - 3} 条记录</p>` : ''}
        </div>
    `;
    
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function batchDeleteWechatConfirm() {
    const table = document.getElementById('wechat-table-body');
    if (!table) {
        showNotification('表格数据未加载，请刷新页面', 'error');
        return;
    }
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showNotification('请先选择要删除的记录', 'error');
        return;
    }
    
    const submissions = getAllSubmissions();
    const idsToDelete = [];
    const recordsToDelete = [];
    
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const recordId = row.dataset.id;
        if (recordId) {
            const recordIdStr = recordId.toString();
            const record = submissions.find(s => s.id && s.id.toString() === recordIdStr);
            if (record) {
                idsToDelete.push(recordIdStr);
                recordsToDelete.push(record);
            }
        }
    });
    
    if (idsToDelete.length === 0) {
        showNotification('未找到选中的有效记录', 'error');
        return;
    }
    
    deleteQueue = {
        type: 'wechat',
        ids: idsToDelete,
        records: recordsToDelete,
        isBatch: true
    };
    
    document.getElementById('delete-title').textContent = `确认删除 ${idsToDelete.length} 条记录`;
    document.getElementById('delete-message').innerHTML = `
        <p>您确定要删除选中的 <strong>${idsToDelete.length}</strong> 条记录吗？</p>
        <div class="records-preview">
            ${recordsToDelete.slice(0, 3).map(record => `
                <div class="record-item" style="padding: 5px 0; border-bottom: 1px solid #eee;">
                    <strong>${getSubmissionField(record, 'name', record.type) || '未知用户'}</strong>
                    - ${getSubmissionField(record, 'company', record.type) || '未知公司'}
                    <small style="color: #666;">(${getTypeLabel(record.type || 'wechat')})</small>
                </div>
            `).join('')}
            ${recordsToDelete.length > 3 ? `<p style="margin-top: 10px; color: #666;">... 以及另外 ${recordsToDelete.length - 3} 条记录</p>` : ''}
        </div>
    `;
    
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function batchDeletePartnershipConfirm() {
    const table = document.getElementById('partnership-table-body');
    if (!table) {
        showNotification('表格数据未加载，请刷新页面', 'error');
        return;
    }
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showNotification('请先选择要删除的记录', 'error');
        return;
    }
    
    const submissions = getAllSubmissions();
    const idsToDelete = [];
    const recordsToDelete = [];
    
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const recordId = row.dataset.id;
        if (recordId) {
            const recordIdStr = recordId.toString();
            const record = submissions.find(s => s.id && s.id.toString() === recordIdStr);
            if (record) {
                idsToDelete.push(recordIdStr);
                recordsToDelete.push(record);
            }
        }
    });
    
    if (idsToDelete.length === 0) {
        showNotification('未找到选中的有效记录', 'error');
        return;
    }
    
    deleteQueue = {
        type: 'partnership',
        ids: idsToDelete,
        records: recordsToDelete,
        isBatch: true
    };
    
    document.getElementById('delete-title').textContent = `确认删除 ${idsToDelete.length} 条记录`;
    document.getElementById('delete-message').innerHTML = `
        <p>您确定要删除选中的 <strong>${idsToDelete.length}</strong> 条记录吗？</p>
        <div class="records-preview">
            ${recordsToDelete.slice(0, 3).map(record => `
                <div class="record-item" style="padding: 5px 0; border-bottom: 1px solid #eee;">
                    <strong>${getSubmissionField(record, 'name', record.type) || '未知用户'}</strong>
                    - ${getSubmissionField(record, 'company', record.type) || '未知公司'}
                    <small style="color: #666;">(${getTypeLabel(record.type || 'partnership')})</small>
                </div>
            `).join('')}
            ${recordsToDelete.length > 3 ? `<p style="margin-top: 10px; color: #666;">... 以及另外 ${recordsToDelete.length - 3} 条记录</p>` : ''}
        </div>
    `;
    
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function batchDeleteOtherConfirm() {
    const table = document.getElementById('other-table-body');
    if (!table) {
        showNotification('表格数据未加载，请刷新页面', 'error');
        return;
    }
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"].row-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showNotification('请先选择要删除的记录', 'error');
        return;
    }
    
    const submissions = getAllSubmissions();
    const idsToDelete = [];
    const recordsToDelete = [];
    
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const recordId = row.dataset.id;
        if (recordId) {
            const recordIdStr = recordId.toString();
            const record = submissions.find(s => s.id && s.id.toString() === recordIdStr);
            if (record) {
                idsToDelete.push(recordIdStr);
                recordsToDelete.push(record);
            }
        }
    });
    
    if (idsToDelete.length === 0) {
        showNotification('未找到选中的有效记录', 'error');
        return;
    }
    
    deleteQueue = {
        type: 'other',
        ids: idsToDelete,
        records: recordsToDelete,
        isBatch: true
    };
    
    document.getElementById('delete-title').textContent = `确认删除 ${idsToDelete.length} 条记录`;
    document.getElementById('delete-message').innerHTML = `
        <p>您确定要删除选中的 <strong>${idsToDelete.length}</strong> 条记录吗？</p>
        <div class="records-preview">
            ${recordsToDelete.slice(0, 3).map(record => `
                <div class="record-item" style="padding: 5px 0; border-bottom: 1px solid #eee;">
                    <strong>${getSubmissionField(record, 'name', record.type) || '未知用户'}</strong>
                    - ${getSubmissionField(record, 'company', record.type) || '未知公司'}
                    <small style="color: #666;">(${getTypeLabel(record.type || 'other')})</small>
                </div>
            `).join('')}
            ${recordsToDelete.length > 3 ? `<p style="margin-top: 10px; color: #666;">... 以及另外 ${recordsToDelete.length - 3} 条记录</p>` : ''}
        </div>
    `;
    
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function executeDelete() {
    if (deleteQueue.ids.length === 0) {
        showNotification('没有要删除的记录', 'error');
        return;
    }
    
    lastDeletedRecords = [...deleteQueue.records];
    
    const allSubmissions = getAllSubmissions();
    const remainingSubmissions = allSubmissions.filter(sub => {
        const subIdStr = sub.id ? sub.id.toString() : '';
        return !deleteQueue.ids.some(idToDelete => 
            idToDelete.toString() === subIdStr
        );
    });
    
    const actuallyDeleted = allSubmissions.length - remainingSubmissions.length;
    
    localStorage.setItem('cement_submissions', JSON.stringify(remainingSubmissions));
    
    closeModal('delete-confirm-modal');
    showUndoNotification(actuallyDeleted);
    
    refreshCurrentPage();
    updateCounts();
    
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadStats();
    }
    
    deleteQueue = { type: '', ids: [], records: [], isBatch: false };
    
    setTimeout(() => {
        hideUndoNotification();
        lastDeletedRecords = [];
    }, UNDO_TIMEOUT);
}

function undoLastDelete() {
    if (lastDeletedRecords.length === 0) {
        showNotification('没有可撤销的删除操作', 'info');
        return;
    }
    
    const currentSubmissions = getAllSubmissions();
    const restoredSubmissions = [...currentSubmissions, ...lastDeletedRecords];
    
    restoredSubmissions.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.id).getTime();
        const timeB = new Date(b.timestamp || b.id).getTime();
        return timeB - timeA;
    });
    
    localStorage.setItem('cement_submissions', JSON.stringify(restoredSubmissions));
    
    hideUndoNotification();
    showNotification(`已恢复 ${lastDeletedRecords.length} 条记录`, 'success');
    
    refreshCurrentPage();
    updateCounts();
    
    lastDeletedRecords = [];
}

function showUndoNotification(count) {
    const undoNote = document.getElementById('undo-notification');
    if (undoNote) {
        undoNote.style.display = 'block';
        undoNote.querySelector('span').textContent = `✅ 成功删除 ${count} 条记录`;
    }
}

function hideUndoNotification() {
    const undoNote = document.getElementById('undo-notification');
    if (undoNote) {
        undoNote.style.display = 'none';
    }
}

// ==================== 数据导出功能 ====================
function loadExportSection() {
    updateExportStats();
    loadExportHistory();
}

function updateExportStats() {
    const submissions = getAllSubmissions();
    const totalCount = submissions.length;
    
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
    
    document.getElementById('export-total-count').textContent = totalCount;
    document.getElementById('export-consultation-count').textContent = counts.consultation;
    document.getElementById('export-wechat-count').textContent = counts.wechat;
    document.getElementById('export-partnership-count').textContent = counts.partnership;
    document.getElementById('export-other-count').textContent = counts.other;
}

function loadExportHistory() {
    const tbody = document.getElementById('export-history-body');
    if (!tbody) return;
    
    let exportHistory = JSON.parse(localStorage.getItem('cement_export_history') || '[]');
    
    if (exportHistory.length === 0) {
        exportHistory = [
            {
                id: Date.now() - 86400000,
                timestamp: new Date(Date.now() - 86400000).toLocaleString(),
                filename: '水泥安环智脑_预约咨询_2024-06-15.csv',
                count: 15,
                format: 'CSV',
                size: '2.3KB'
            },
            {
                id: Date.now() - 172800000,
                timestamp: new Date(Date.now() - 172800000).toLocaleString(),
                filename: '水泥安环智脑_全部数据_2024-06-14.xlsx',
                count: 42,
                format: 'Excel',
                size: '5.7KB'
            }
        ];
        localStorage.setItem('cement_export_history', JSON.stringify(exportHistory));
    }
    
    tbody.innerHTML = '';
    
    exportHistory.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.timestamp}</td>
            <td>${record.filename}</td>
            <td>${record.count} 条</td>
            <td>${record.format}</td>
            <td>${record.size}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="downloadExportRecord('${record.filename}')">
                    重新下载
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function exportAllData(format = 'csv') {
    const submissions = getAllSubmissions();
    if (submissions.length === 0) {
        showNotification('没有数据可以导出', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    let filename = '';
    
    switch (format) {
        case 'csv':
            filename = `水泥安环智脑_全部数据_${today}.csv`;
            exportToCSV(submissions, filename);
            break;
        case 'excel':
            filename = `水泥安环智脑_全部数据_${today}.xls`;
            exportToExcel(submissions, filename);
            break;
        case 'json':
            filename = `水泥安环智脑_全部数据_${today}.json`;
            exportToJSON(submissions, filename);
            break;
        default:
            showNotification('不支持的导出格式', 'error');
            return;
    }
    
    recordExportHistory({
        type: '全部数据',
        count: submissions.length,
        format: format.toUpperCase(),
        filename: filename
    });
}

function exportByType() {
    const type = document.getElementById('export-type-select').value;
    const dateFrom = document.getElementById('export-date-from').value;
    const dateTo = document.getElementById('export-date-to').value;
    
    let submissions = getAllSubmissions();
    
    submissions = submissions.filter(sub => {
        const subType = sub.type || 'consultation';
        return subType === type;
    });
    
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        submissions = submissions.filter(sub => {
            const subDate = new Date(sub.timestamp || sub.id);
            return subDate >= fromDate;
        });
    }
    
    if (dateTo) {
        const toDate = new Date(dateTo + 'T23:59:59');
        submissions = submissions.filter(sub => {
            const subDate = new Date(sub.timestamp || sub.id);
            return subDate <= toDate;
        });
    }
    
    if (submissions.length === 0) {
        showNotification('没有符合条件的数据可以导出', 'error');
        return;
    }
    
    const typeLabel = getTypeLabel(type);
    const today = new Date().toISOString().split('T')[0];
    const filename = `水泥安环智脑_${typeLabel}_${today}`;
    
    exportToCSV(submissions, filename + '.csv');
    
    recordExportHistory({
        type: typeLabel,
        count: submissions.length,
        format: 'CSV',
        filename: filename + '.csv',
        dateRange: dateFrom && dateTo ? `${dateFrom} 至 ${dateTo}` : '全部时间'
    });
}

function exportToCSV(submissions, filename) {
    let csv = 'ID,提交时间,咨询类型,姓名,职位,公司,行业,邮箱,手机,服务/目的,描述,状态,备注\n';
    
    submissions.forEach(sub => {
        const type = sub.type || 'consultation';
        const row = [
            sub.id || '',
            sub.timestamp || '',
            getTypeLabel(type),
            getSubmissionField(sub, 'name', type) || '',
            getSubmissionField(sub, 'position', type) || '',
            getSubmissionField(sub, 'company', type) || '',
            getIndustryLabel(getSubmissionField(sub, 'industry', type)) || '',
            getSubmissionField(sub, 'email', type) || '',
            getSubmissionField(sub, 'phone', type) || '',
            getSubmissionField(sub, 'service', type) || 
            getSubmissionField(sub, 'purpose', type) || 
            getSubmissionField(sub, 'cooperation', type) || 
            getSubmissionField(sub, 'category', type) || '',
            (getSubmissionField(sub, 'needs', type) || 
             getSubmissionField(sub, 'description', type) || 
             getSubmissionField(sub, 'content', type) || '').replace(/"/g, '""').replace(/\n/g, ' '),
            getStatusLabel(sub.status || 'pending'),
            (sub.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')
        ];
        
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    if (!filename.endsWith('.csv')) {
        filename += '.csv';
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`CSV文件导出成功！共导出 ${submissions.length} 条记录。`, 'success');
}

function exportToExcel(submissions, filename) {
    // 简化的Excel导出 - 实际使用时可能需要使用库如SheetJS
    exportToCSV(submissions, filename.replace('.xls', '.csv'));
}

function exportToJSON(submissions, filename) {
    const jsonData = JSON.stringify(submissions, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    if (!filename.endsWith('.json')) {
        filename += '.json';
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`JSON文件导出成功！共导出 ${submissions.length} 条记录。`, 'success');
}

function recordExportHistory(info) {
    let exportHistory = [];
    try {
        const stored = localStorage.getItem('cement_export_history');
        if (stored) {
            exportHistory = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取导出历史失败:', error);
        exportHistory = [];
    }
    
    const record = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        filename: info.filename || `水泥安环智脑_导出_${new Date().toISOString().split('T')[0]}`,
        count: info.count || 0,
        format: info.format || 'CSV',
        size: calculateFileSize(info.count || 0),
        type: info.type || '未知',
        dateRange: info.dateRange || '全部时间'
    };
    
    exportHistory.unshift(record);
    
    if (exportHistory.length > 20) {
        exportHistory = exportHistory.slice(0, 20);
    }
    
    try {
        localStorage.setItem('cement_export_history', JSON.stringify(exportHistory));
    } catch (error) {
        console.error('保存导出历史失败:', error);
        showNotification('保存导出记录失败', 'error');
    }
    
    const exportSection = document.getElementById('export');
    if (exportSection && exportSection.classList.contains('active')) {
        loadExportHistory();
    }
}

function calculateFileSize(recordCount) {
    const avgSizePerRecord = 500;
    const totalBytes = recordCount * avgSizePerRecord;
    
    if (totalBytes < 1024) {
        return totalBytes + 'B';
    } else if (totalBytes < 1024 * 1024) {
        return (totalBytes / 1024).toFixed(1) + 'KB';
    } else {
        return (totalBytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
}

function downloadExportRecord(filename) {
    showNotification('重新下载功能已调用，但需要服务器支持', 'info');
}

function batchExport() {
    const types = [];
    
    if (document.getElementById('export-consultation').checked) {
        types.push('consultation');
    }
    if (document.getElementById('export-wechat').checked) {
        types.push('wechat');
    }
    if (document.getElementById('export-partnership').checked) {
        types.push('partnership');
    }
    if (document.getElementById('export-other').checked) {
        types.push('other');
    }
    
    if (types.length === 0) {
        showNotification('请至少选择一种数据类型', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `水泥安环智脑_批量导出_${today}`;
    
    let allData = [];
    types.forEach(type => {
        const submissions = getAllSubmissions().filter(sub => 
            (sub.type || 'consultation') === type
        );
        allData = allData.concat(submissions);
    });
    
    if (allData.length === 0) {
        showNotification('所选类型没有数据可以导出', 'error');
        return;
    }
    
    exportToCSV(allData, filename + '.csv');
    
    recordExportHistory({
        type: `批量导出 (${types.map(t => getTypeLabel(t)).join(', ')})`,
        count: allData.length,
        format: 'CSV',
        filename: filename + '.csv'
    });
}

function exportData(type) {
    let submissions = getAllSubmissions();
    
    submissions = submissions.filter(sub => 
        (sub.type || 'consultation') === type
    );
    
    if (submissions.length === 0) {
        showNotification(`没有${getTypeLabel(type)}数据可以导出`, 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `水泥安环智脑_${getTypeLabel(type)}_${today}`;
    
    exportToCSV(submissions, filename + '.csv');
    
    recordExportHistory({
        type: getTypeLabel(type),
        count: submissions.length,
        format: 'CSV',
        filename: filename + '.csv'
    });
}

function exportCurrentData() {
    showNotification('导出当前数据功能', 'info');
}

function manualSyncContactData() {
    console.log('手动同步数据...');
    const submissions = getAllSubmissions();
    showNotification(`数据已重新加载，共 ${submissions.length} 条记录`, 'success');
    refreshCurrentPage();
}

// 确保函数全局可用
window.manualSyncContactData = manualSyncContactData;

// 使函数全局可用
window.switchSection = switchSection;
window.viewDetail = viewDetail;
window.editSubmission = editSubmission;
window.confirmDelete = confirmDelete;
window.toggleSelectAll = toggleSelectAll;
window.toggleSelectAllWechat = toggleSelectAllWechat;
window.toggleSelectAllPartnership = toggleSelectAllPartnership;
window.toggleSelectAllOther = toggleSelectAllOther;
window.updateBatchToolbar = updateBatchToolbar;
window.updateWechatBatchToolbar = updateWechatBatchToolbar;
window.updatePartnershipBatchToolbar = updatePartnershipBatchToolbar;
window.updateOtherBatchToolbar = updateOtherBatchToolbar;
window.batchDeleteConfirm = batchDeleteConfirm;
window.batchDeleteWechatConfirm = batchDeleteWechatConfirm;
window.batchDeletePartnershipConfirm = batchDeletePartnershipConfirm;
window.batchDeleteOtherConfirm = batchDeleteOtherConfirm;
window.clearSelection = clearSelection;
window.clearWechatSelection = clearWechatSelection;
window.clearPartnershipSelection = clearPartnershipSelection;
window.clearOtherSelection = clearOtherSelection;
window.executeDelete = executeDelete;
window.undoLastDelete = undoLastDelete;
window.hideUndoNotification = hideUndoNotification;
window.closeModal = closeModal;
window.exportAllData = exportAllData;
window.exportByType = exportByType;
window.batchExport = batchExport;
window.downloadExportRecord = downloadExportRecord;
window.openChangePasswordModal = openChangePasswordModal;
window.checkPasswordStrength = checkPasswordStrength;
window.checkPasswordMatch = checkPasswordMatch;
window.fixDataTypes = fixDataTypes;
window.createComprehensiveTestData = createComprehensiveTestData;
window.refreshCurrentPage = refreshCurrentPage;
window.backupData = backupData;
window.cleanOldData = cleanOldData;
window.cleanAllTestData = cleanAllTestData;
window.showBackupHistory = showBackupHistory;
window.restoreBackup = restoreBackup;
window.deleteBackup = deleteBackup;
window.handleEditSubmit = handleEditSubmit;
window.refreshData = refreshCurrentPage;
window.exportData = exportData;