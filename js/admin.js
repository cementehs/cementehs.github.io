// 管理后台主功能
// 在 DOMContentLoaded 事件中添加模态框事件初始化
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
    
    // 测试数据按钮
    const testDataBtn = document.getElementById('add-test-data');
    if (testDataBtn) {
        testDataBtn.addEventListener('click', function() {
            if (confirm('确定要添加测试数据吗？这会覆盖现有数据。')) {
                createInstantTestData();
            }
        });
    }
    
    // 初始化模态框事件
    initModalEvents();
    
    console.log('✅ 事件监听器已设置');
});

// 初始化模态框事件
function initModalEvents() {
    console.log('初始化模态框事件...');
    
    // 绑定详情模态框的关闭按钮
    const detailModal = document.getElementById('detail-modal');
    const detailCloseBtn = detailModal?.querySelector('.modal-close');
    
    if (detailCloseBtn) {
        // 移除之前的事件监听器，避免重复绑定
        detailCloseBtn.replaceWith(detailCloseBtn.cloneNode(true));
        const newCloseBtn = detailModal.querySelector('.modal-close');
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('关闭详情模态框');
            detailModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        console.log('✅ 详情模态框关闭按钮已绑定');
    } else {
        console.error('❌ 未找到详情模态框关闭按钮');
    }
    
    // 绑定编辑模态框的关闭按钮
    const editModal = document.getElementById('edit-modal');
    const editCloseBtn = editModal?.querySelector('.modal-close');
    
    if (editCloseBtn) {
        editCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('关闭编辑模态框');
            editModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        console.log('✅ 编辑模态框关闭按钮已绑定');
    }
    
    // 点击模态框外部关闭
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                console.log('点击模态框外部，关闭模态框');
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            console.log('按下ESC键，关闭所有模态框');
            modals.forEach(modal => {
                if (modal.style.display === 'block' || modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
    
    console.log('✅ 模态框事件初始化完成');
}

// 在 viewDetail 函数中，确保模态框正确显示后重新绑定事件
function viewDetail(id) {
    console.log('查看详情，ID:', id);
    
    // 获取数据
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
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
    content.innerHTML = buildDetailContent(submission);
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 重新绑定关闭按钮事件（确保事件存在）
    setTimeout(() => {
        bindModalCloseEvents();
    }, 100);
    
    console.log('详情模态框已显示');
}

// 单独绑定模态框关闭事件的函数
function bindModalCloseEvents() {
    console.log('绑定模态框关闭事件...');
    
    // 绑定所有模态框的关闭按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
        // 移除现有的事件监听器（通过克隆节点）
        const modal = btn.closest('.modal');
        if (modal) {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('关闭模态框:', modal.id);
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            };
        }
    });
    
    console.log('✅ 模态框关闭事件已绑定');
}

// 检查认证状态
function checkAuth() {
    console.log('检查登录状态...');
    
    try {
        const authData = JSON.parse(localStorage.getItem('admin_auth') || 'null');
        
        if (authData) {
            // 检查是否过期（24小时）
            const hoursElapsed = (Date.now() - authData.timestamp) / (1000 * 60 * 60);
            
            if (hoursElapsed < 24 || authData.remember) {
                console.log('✅ 用户已登录');
                // 已登录，显示管理页面
                switchToDashboard(authData.username);
            } else {
                console.log('登录已过期');
                localStorage.removeItem('admin_auth');
            }
        } else {
            console.log('用户未登录');
        }
    } catch (error) {
        console.error('检查登录状态时出错:', error);
        localStorage.removeItem('admin_auth');
    }
}

// 登录处理
// ==================== 修复后的登录处理函数 ====================


// 切换到管理页面
function switchToDashboard(username) {
    console.log('开始切换到管理页面...');
    
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    
    if (!loginPage || !dashboardPage) {
        console.error('页面元素未找到');
        alert('页面加载错误，请刷新页面');
        return;
    }
    
    // 隐藏登录页面
    loginPage.style.display = 'none';
    
    // 显示管理页面
    dashboardPage.style.display = 'block';
    
    // 更新用户名
    const userSpan = document.getElementById('current-user');
    if (userSpan) {
        userSpan.textContent = username || '管理员';
    }
    
    console.log('✅ 页面切换完成');
    
    // 延迟初始化管理页面
    setTimeout(() => {
        try {
            console.log('开始初始化管理页面...');
            loadStats();
            loadRecentSubmissions();
            updateCounts();
            console.log('✅ 管理页面初始化完成');
        } catch (error) {
            console.error('❌ 初始化失败:', error);
        }
    }, 100);
}

// 切换页面
// 在 switchSection 函数中，确保有这些case
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
        case 'export':
            loadExportSection();
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
}

// 获取所有提交
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
    
    // 按时间倒序排序
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
        
        const name = getSubmissionField(sub, 'name', sub.type) || '未知';
        const company = getSubmissionField(sub, 'company', sub.type) || '-';
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
        s.type === 'consultation' || (!s.type && s['consult-name'])
    );
    
    const tbody = document.getElementById('consultation-table-body');
    
    // 【重要修复】先检查 tbody 是否存在
    if (!tbody) {
        console.error('未找到表格tbody元素: consultation-table-body');
        return;
    }
    
    // 【重要修复】先检查 table 是否存在
    const table = tbody.closest('table');
    if (!table) {
        console.error('未找到表格元素');
        return;
    }
    
    // 确保表头有复选框列
    const thead = table.querySelector('thead tr');
    if (thead && !thead.querySelector('th:first-child input[type="checkbox"]')) {
        const selectAllTh = document.createElement('th');
        selectAllTh.innerHTML = '<input type="checkbox" onclick="toggleSelectAll(this)">';
        thead.insertBefore(selectAllTh, thead.firstChild);
        
        // 同时需要增加表头的colspan
        const headerCells = thead.querySelectorAll('th');
        if (headerCells.length > 1) {
            // 更新表头提示，现在有9列（1个复选框+7个数据列+1个操作列）
            const headerText = thead.querySelector('th:not(:first-child)');
            if (headerText) {
                // 可以根据需要调整表头文本
            }
        }
    }
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        // 注意：colspan现在是9，因为有新增的复选框列
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
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const service = getSubmissionField(sub, 'service', type) || '-';
        const time = getSubmissionField(sub, 'time', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        
        // 添加 data-id 属性（用于批量操作）
        row.dataset.id = recordId;
        
        // 第一列：复选框
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

                // 【关键修复】修复复选框事件绑定
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            console.log(`复选框点击，当前状态: ${this.checked}`);
            
            // 更新行的高亮状态
            const row = this.closest('tr');
            const isSelected = this.checked;
            row.dataset.selected = isSelected;
            
            // 添加或移除选中样式
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
            
            // 更新批量工具栏
            setTimeout(updateBatchToolbar, 10);
        });
        
        // 也添加 change 事件作为备份
        checkbox.addEventListener('change', function(e) {
            console.log(`复选框状态改变，当前选中: ${this.checked}`);
            updateBatchToolbar();
        });

        // 【关键修复】修复复选框事件绑定
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            console.log(`复选框点击，当前状态: ${this.checked}`);
            
            // 更新行的高亮状态
            const row = this.closest('tr');
            const isSelected = this.checked;
            row.dataset.selected = isSelected;
            
            // 添加或移除选中样式
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
            
            // 更新批量工具栏
            setTimeout(updateBatchToolbar, 10);
        });
        
        // 也添加 change 事件作为备份
        checkbox.addEventListener('change', function(e) {
            console.log(`复选框状态改变，当前选中: ${this.checked}`);
            updateBatchToolbar();
        });

        // 【在这里添加事件监听】
        checkbox.addEventListener('change', function() {
            // 更新行的高亮状态
            const row = this.closest('tr');
            const isSelected = this.checked;
            row.dataset.selected = isSelected;
            
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
            
            // 更新批量工具栏
            setTimeout(updateBatchToolbar, 10);
        });
        
        // 第二列：提交时间
        const timeCell = document.createElement('td');
        timeCell.textContent = formatDate(sub.timestamp);
        row.appendChild(timeCell);
        
        // 第三列：姓名
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        // 第四列：公司
        const companyCell = document.createElement('td');
        companyCell.textContent = company;
        row.appendChild(companyCell);
        
        // 第五列：职位
        const positionCell = document.createElement('td');
        positionCell.textContent = position;
        row.appendChild(positionCell);
        
        // 第六列：感兴趣服务
        const serviceCell = document.createElement('td');
        serviceCell.textContent = getServiceLabel(service);
        row.appendChild(serviceCell);
        
        // 第七列：期望时间
        const timePrefCell = document.createElement('td');
        timePrefCell.textContent = getTimeLabel(time);
        row.appendChild(timePrefCell);
        
        // 第八列：状态
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${status}">${getStatusLabel(status)}</span>`;
        row.appendChild(statusCell);
        
        // 第九列：操作按钮
        const actionCell = document.createElement('td');
        actionCell.className = 'action-buttons';
        actionCell.innerHTML = `
            <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                <span>👁️</span> 详情
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                <span>✏️</span> 编辑
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '${getTypeLabel(type)}')" title="删除此记录">
                <span>🗑️</span> 删除
            </button>
        `;
        row.appendChild(actionCell);
        
        tbody.appendChild(row);

        
        // 在 loadConsultations() 函数中，找到创建表格行的部分：
        // 在创建 row 元素后，添加以下代码：

        row.addEventListener('click', function(e) {
            // 如果是点击复选框，不切换高亮
            if (e.target.type === 'checkbox') {
                const isSelected = e.target.checked;
                row.dataset.selected = isSelected;
                updateRowHighlight(row, isSelected);
                updateBatchToolbar();
            }
        });

        // 添加更新行高亮的函数
        function updateRowHighlight(row, isSelected) {
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
        }

        // 添加选中的行样式到 CSS
        const selectedRowStyle = document.createElement('style');
        selectedRowStyle.textContent = `
            .selected-row {
                background-color: rgba(42, 91, 158, 0.08) !important;
            }
            .selected-row:hover {
                background-color: rgba(42, 91, 158, 0.12) !important;
            }
            .selected-row td {
                border-left: 3px solid #2a5b9e !important;
            }
        `;
        document.head.appendChild(selectedRowStyle);
    });
    
    // 更新批量工具栏状态
    setTimeout(() => {
        updateBatchToolbar();
    }, 100);
    
    console.log(`✅ 预约咨询数据加载完成，共 ${submissions.length} 条记录`);
}

// 加载导出页面
function loadExportSection() {
    console.log('加载数据导出页面');
    
    // 更新统计数据
    updateExportStats();
    
    // 加载导出记录
    loadExportHistory();
}

// 更新导出统计数据
function updateExportStats() {
    const submissions = getAllSubmissions();
    const totalCount = submissions.length;
    
    // 计算各类型数量
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
    document.getElementById('export-total-count').textContent = totalCount;
    document.getElementById('export-consultation-count').textContent = counts.consultation;
    document.getElementById('export-wechat-count').textContent = counts.wechat;
    document.getElementById('export-partnership-count').textContent = counts.partnership;
    document.getElementById('export-other-count').textContent = counts.other;
}

// 加载导出历史记录
function loadExportHistory() {
    const tbody = document.getElementById('export-history-body');
    if (!tbody) return;
    
    // 从localStorage获取导出历史
    let exportHistory = JSON.parse(localStorage.getItem('cement_export_history') || '[]');
    
    // 如果为空，添加一些示例记录
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

// 导出全部数据
// 导出全部数据
function exportAllData(format = 'csv') {
    console.log(`导出全部数据，格式: ${format}`);
    
    const submissions = getAllSubmissions();
    if (submissions.length === 0) {
        showNotification('没有数据可以导出', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    let filename = '';
    let exportFunction = null;
    
    switch (format) {
        case 'csv':
            filename = `水泥安环智脑_全部数据_${today}.csv`;
            exportFunction = () => exportToCSV(submissions, filename);
            break;
        case 'excel':
            filename = `水泥安环智脑_全部数据_${today}.xls`;
            exportFunction = () => exportToExcel(submissions, filename);
            break;
        case 'json':
            filename = `水泥安环智脑_全部数据_${today}.json`;
            exportFunction = () => exportToJSON(submissions, filename);
            break;
        default:
            showNotification('不支持的导出格式', 'error');
            return;
    }
    
    // 执行导出
    if (exportFunction) {
        exportFunction();
        
        // 记录导出历史
        recordExportHistory({
            type: '全部数据',
            count: submissions.length,
            format: format.toUpperCase(),
            filename: filename
        });
    }
}

// 按类型导出
function exportByType() {
    const type = document.getElementById('export-type-select').value;
    const dateFrom = document.getElementById('export-date-from').value;
    const dateTo = document.getElementById('export-date-to').value;
    
    console.log(`按类型导出: ${type}, 时间范围: ${dateFrom} - ${dateTo}`);
    
    let submissions = getAllSubmissions();
    
    // 按类型筛选
    submissions = submissions.filter(sub => {
        const subType = sub.type || 'consultation';
        return subType === type;
    });
    
    // 按时间范围筛选
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
    
    exportToCSV(submissions, filename);
    
    // 记录导出历史
    recordExportHistory({
        type: typeLabel,
        count: submissions.length,
        format: 'CSV',
        filename: filename + '.csv',
        dateRange: dateFrom && dateTo ? `${dateFrom} 至 ${dateTo}` : '全部时间'
    });
}

// 导出为CSV格式
function exportToCSV(submissions, filename) {
    console.log(`导出CSV，数据量: ${submissions.length}`);
    
    // 构建CSV头部
    let csv = 'ID,提交时间,咨询类型,姓名,职位,公司,行业,邮箱,手机,服务/目的,描述,状态,备注\n';
    
    // 添加数据行
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
    
    // 创建下载
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 确保文件名包含.csv扩展名
    if (!filename.endsWith('.csv')) {
        filename += '.csv';
    }
    
    link.download = filename;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV导出完成，文件名:', filename);
    
    // 记录导出历史（仅在导出全部数据时调用）recordExportHistory
    // 注意：exportAllData 函数会单独调用 
}

// 记录导出历史
function recordExportHistory(info) {
    console.log('记录导出历史:', info);
    
    // 获取现有导出历史
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
    
    // 创建新记录
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
    
    console.log('新导出记录:', record);
    
    // 添加到历史记录
    exportHistory.unshift(record);
    
    // 只保留最近的20条记录
    if (exportHistory.length > 20) {
        exportHistory = exportHistory.slice(0, 20);
    }
    
    // 保存到localStorage
    try {
        localStorage.setItem('cement_export_history', JSON.stringify(exportHistory));
        console.log('导出历史保存成功，当前记录数:', exportHistory.length);
    } catch (error) {
        console.error('保存导出历史失败:', error);
        showNotification('保存导出记录失败', 'error');
    }
    
    // 如果当前在导出页面，刷新导出记录列表
    const exportSection = document.getElementById('export');
    if (exportSection && exportSection.classList.contains('active')) {
        console.log('当前在导出页面，刷新导出记录列表');
        loadExportHistory();
    }
}

// 计算文件大小
function calculateFileSize(recordCount) {
    const avgSizePerRecord = 500; // 假设每条记录平均500字节
    const totalBytes = recordCount * avgSizePerRecord;
    
    if (totalBytes < 1024) {
        return totalBytes + 'B';
    } else if (totalBytes < 1024 * 1024) {
        return (totalBytes / 1024).toFixed(1) + 'KB';
    } else {
        return (totalBytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
}

// 按类型导出
function exportByType() {
    const type = document.getElementById('export-type-select').value;
    
    console.log(`按类型导出: ${type}`);
    
    let submissions = getAllSubmissions();
    
    // 按类型筛选
    submissions = submissions.filter(sub => {
        const subType = sub.type || 'consultation';
        return subType === type;
    });
    
    if (submissions.length === 0) {
        alert('没有符合条件的数据可以导出');
        return;
    }
    
    exportToCSV(submissions, getTypeLabel(type));
}

// 导出为CSV格式
function exportToCSV(submissions, filename) {
    console.log(`导出CSV，数据量: ${submissions.length}`);
    
    // 构建CSV头部
    let csv = 'ID,提交时间,咨询类型,姓名,职位,公司,行业,邮箱,手机,服务/目的,描述,状态,备注\n';
    
    // 添加数据行
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
    
    // 创建下载
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 确保文件名包含.csv扩展名
    if (!filename.endsWith('.csv')) {
        filename += '.csv';
    }
    
    link.download = filename;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('CSV导出完成，文件名:', filename);
    showNotification(`CSV文件导出成功！共导出 ${submissions.length} 条记录。`, 'success');
    
    return filename;
}

// 导出为Excel格式
function exportToExcel(submissions, filename) {
    console.log(`导出Excel，数据量: ${submissions.length}`);
    
    // 创建HTML表格用于导出
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h2>水泥安环智脑 - 数据导出</h2>
            <p>导出时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>记录总数: ${submissions.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>提交时间</th>
                        <th>咨询类型</th>
                        <th>姓名</th>
                        <th>职位</th>
                        <th>公司</th>
                        <th>行业</th>
                        <th>邮箱</th>
                        <th>手机</th>
                        <th>服务/目的</th>
                        <th>描述</th>
                        <th>状态</th>
                        <th>备注</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加数据行
    submissions.forEach(sub => {
        const type = sub.type || 'consultation';
        html += `
            <tr>
                <td>${sub.id || ''}</td>
                <td>${sub.timestamp || ''}</td>
                <td>${getTypeLabel(type)}</td>
                <td>${getSubmissionField(sub, 'name', type) || ''}</td>
                <td>${getSubmissionField(sub, 'position', type) || ''}</td>
                <td>${getSubmissionField(sub, 'company', type) || ''}</td>
                <td>${getIndustryLabel(getSubmissionField(sub, 'industry', type)) || ''}</td>
                <td>${getSubmissionField(sub, 'email', type) || ''}</td>
                <td>${getSubmissionField(sub, 'phone', type) || ''}</td>
                <td>${getSubmissionField(sub, 'service', type) || 
                     getSubmissionField(sub, 'purpose', type) || 
                     getSubmissionField(sub, 'cooperation', type) || 
                     getSubmissionField(sub, 'category', type) || ''}</td>
                <td>${(getSubmissionField(sub, 'needs', type) || 
                      getSubmissionField(sub, 'description', type) || 
                      getSubmissionField(sub, 'content', type) || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${getStatusLabel(sub.status || 'pending')}</td>
                <td>${(sub.notes || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    // 创建下载
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 确保文件名包含.xls扩展名
    if (!filename.endsWith('.xls') && !filename.endsWith('.xlsx')) {
        filename += '.xls';
    }
    
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('Excel导出完成，文件名:', filename);
    showNotification(`Excel文件导出成功！共导出 ${submissions.length} 条记录。`, 'success');
    
    return filename;
}

// 导出为JSON格式
function exportToJSON(submissions, filename) {
    console.log(`导出JSON，数据量: ${submissions.length}`);
    
    // 创建JSON数据
    const exportData = {
        exportInfo: {
            title: '水泥安环智脑数据导出',
            exportTime: new Date().toISOString(),
            recordCount: submissions.length,
            name: '全部数据'
        },
        data: submissions
    };
    
    // 创建下载
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 确保文件名包含.json扩展名
    if (!filename.endsWith('.json')) {
        filename += '.json';
    }
    
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('JSON导出完成，文件名:', filename);
    showNotification(`JSON文件导出成功！共导出 ${submissions.length} 条记录。`, 'success');
    
    return filename;
}

// ========== 辅助函数 ==========

// 获取表单字段
// 获取表单字段
function getSubmissionField(sub, field, type) {
    console.log(`获取字段: ${field}, 类型: ${type}, 数据:`, sub);
    
    // 1. 先尝试直接获取字段（不带前缀）
    if (sub[field] !== undefined) {
        console.log(`直接获取到字段 ${field}:`, sub[field]);
        return sub[field];
    }
    
    // 2. 尝试带前缀的字段名
    const prefixes = {
        'consultation': 'consult',
        'wechat': 'wechat',
        'partnership': 'partner',
        'other': 'other'
    };
    
    const prefix = prefixes[type];
    const prefixedField = prefix ? `${prefix}-${field}` : null;
    
    if (prefixedField && sub[prefixedField] !== undefined) {
        console.log(`通过前缀获取到字段 ${prefixedField}:`, sub[prefixedField]);
        return sub[prefixedField];
    }
    
    // 3. 尝试原始字段名（可能在保存时保留了原始字段名）
    const originalFields = Object.keys(sub).filter(key => 
        key.includes(field) || 
        (prefix && key.includes(prefix) && key.includes(field))
    );
    
    if (originalFields.length > 0) {
        console.log(`找到原始字段:`, originalFields, '值:', sub[originalFields[0]]);
        return sub[originalFields[0]];
    }
    
    console.log(`未找到字段 ${field}`);
    return null;
}

// 格式化日期
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

// 登出
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('admin_auth');
        location.reload();
    }
}

// 查看详情
function viewDetail(id) {
    console.log('查看详情，ID:', id);
    
    // 获取数据
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
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
    
    // 构建详情内容（不转义HTML）
    content.innerHTML = buildDetailContent(submission);
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('详情模态框已显示');
}

// 构建详情内容
function buildDetailContent(submission) {
    const type = submission.type || 'consultation';
    
    // 获取字段值（确保获取正确的字段）
    const name = getSubmissionField(submission, 'name', type) || '未知';
    const company = getSubmissionField(submission, 'company', type) || '-';
    const email = getSubmissionField(submission, 'email', type) || '-';
    const phone = getSubmissionField(submission, 'phone', type) || '-';
    const position = getSubmissionField(submission, 'position', type) || '-';
    const industry = getSubmissionField(submission, 'industry', type) || '-';
    const timestamp = submission.timestamp || '-';
    const status = submission.status || 'pending';
    
    // 构建HTML内容
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
    
    // 根据类型添加特定信息
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
    
    // 如果有备注，显示备注
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

// HTML转义函数
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 编辑提交（简化版）
function editSubmission(id) {
    alert('编辑功能正在开发中...');
}

// 下载导出记录
function downloadExportRecord(filename) {
    console.log('重新下载文件:', filename);
    alert('重新下载功能正在开发中...');
}

// 批量导出
function batchExport() {
    alert('批量导出功能正在开发中...');
}

// 确保全局函数可用
window.viewDetail = viewDetail;
window.editSubmission = editSubmission;
window.exportAllData = exportAllData;
window.exportByType = exportByType;
window.batchExport = batchExport;
window.downloadExportRecord = downloadExportRecord;

// 创建测试数据
function createInstantTestData() {
    console.log('=== 创建测试数据 ===');
    
    const testData = [
        {
            id: Date.now(),
            type: 'consultation',
            timestamp: new Date().toLocaleString('zh-CN'),
            'consult-name': '测试用户',
            'consult-company': '测试公司',
            'consult-email': 'test@example.com',
            'consult-phone': '13800138000',
            status: 'pending'
        }
    ];
    
    localStorage.setItem('cement_submissions', JSON.stringify(testData));
    console.log('✅ 测试数据已创建');
    location.reload();
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

// 调试函数：查看数据格式
function debugSubmission(submission) {
    console.log('=== 调试数据格式 ===');
    console.log('完整数据:', submission);
    console.log('所有字段:', Object.keys(submission));
    
    const type = submission.type || 'consultation';
    console.log('类型:', type);
    
    // 测试获取各种字段
    const fields = ['name', 'company', 'email', 'phone', 'position', 'industry'];
    fields.forEach(field => {
        const value = getSubmissionField(submission, field, type);
        console.log(`${field}:`, value);
    });
}

// 调试函数：查看导出历史
function debugExportHistory() {
    console.log('=== 调试导出历史 ===');
    
    const history = localStorage.getItem('cement_export_history');
    if (history) {
        const parsed = JSON.parse(history);
        console.log('导出历史记录数:', parsed.length);
        console.log('导出历史记录:', parsed);
    } else {
        console.log('没有导出历史记录');
    }
}

// 清空导出历史
function clearExportHistory() {
    if (confirm('确定要清空所有导出记录吗？')) {
        localStorage.removeItem('cement_export_history');
        console.log('导出历史已清空');
        showNotification('导出历史已清空', 'success');
        
        // 刷新导出记录列表
        loadExportHistory();
    }
}

// 添加测试导出记录
function addTestExportRecord() {
    const testRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        filename: '水泥安环智脑_测试导出_2024-06-16.csv',
        count: 25,
        format: 'CSV',
        size: '12.5KB',
        type: '测试数据',
        dateRange: '2024-01-01 至 2024-06-16'
    };
    
    let exportHistory = JSON.parse(localStorage.getItem('cement_export_history') || '[]');
    exportHistory.unshift(testRecord);
    localStorage.setItem('cement_export_history', JSON.stringify(exportHistory));
    
    console.log('测试导出记录已添加');
    showNotification('测试导出记录已添加', 'success');
    
    // 刷新导出记录列表
    loadExportHistory();
}

// 让这些函数在控制台可用
window.debugExportHistory = debugExportHistory;
window.clearExportHistory = clearExportHistory;
window.addTestExportRecord = addTestExportRecord;


// 加载微信咨询数据
function loadWechatSubmissions() {
    console.log('=== 加载微信咨询数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'wechat' || (s['wechat-name'] && !s.type)
    );
    
    console.log(`找到 ${submissions.length} 条微信咨询数据`);
    
    const tbody = document.getElementById('wechat-table-body');
    if (!tbody) {
        console.error('未找到微信咨询表格tbody元素');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    暂无微信咨询数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = 'wechat';
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const industry = getSubmissionField(sub, 'industry', type) || '-';
        const purpose = getSubmissionField(sub, 'purpose', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${position}</td>
            <td>${getIndustryLabel(industry)}</td>
            <td>${getPurposeLabel(purpose)}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewWechatDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editWechatSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('微信咨询表格数据加载完成');
}

// 查看微信咨询详情
function viewWechatDetail(id) {
    console.log('查看微信咨询详情，ID:', id);
    
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
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
    content.innerHTML = buildWechatDetailHTML(submission);
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('微信咨询详情模态框已显示');
}

// 构建微信咨询详情HTML
function buildWechatDetailHTML(submission) {
    const type = 'wechat';
    const status = submission.status || 'pending';
    
    // 获取字段值
    const name = getSubmissionField(submission, 'name', type) || '未知';
    const company = getSubmissionField(submission, 'company', type) || '-';
    const position = getSubmissionField(submission, 'position', type) || '-';
    const industry = getSubmissionField(submission, 'industry', type) || '-';
    const purpose = getSubmissionField(submission, 'purpose', type) || '-';
    const timestamp = submission.timestamp || '-';
    
    return `
        <div class="detail-container">
            <h2 class="detail-title">微信咨询详情</h2>
            
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
                        <span class="detail-value">微信咨询</span>
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
                </div>
            </div>
            
            <div class="detail-card">
                <h3>咨询详情</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">添加目的：</span>
                        <span class="detail-value">${getPurposeLabel(purpose)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">微信账号：</span>
                        <span class="detail-value">${escapeHtml(submission['wechat-account'] || '未提供')}</span>
                    </div>
                </div>
            </div>
            
            ${submission.notes ? `
            <div class="detail-card">
                <h3>处理备注</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(submission.notes)}
                    </pre>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// 编辑微信咨询
function editWechatSubmission(id) {
    console.log('编辑微信咨询，ID:', id);
    
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) return;
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-type').value = 'wechat';
    document.getElementById('edit-status').value = submission.status || 'pending';
    document.getElementById('edit-notes').value = submission.notes || '';
    
    document.getElementById('edit-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 加载合作洽谈数据
function loadPartnershipSubmissions() {
    console.log('=== 加载合作洽谈数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'partnership' || (s['partner-name'] && !s.type)
    );
    
    console.log(`找到 ${submissions.length} 条合作洽谈数据`);
    
    const tbody = document.getElementById('partnership-table-body');
    if (!tbody) {
        console.error('未找到合作洽谈表格tbody元素');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    暂无合作洽谈数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = 'partnership';
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const companyType = getSubmissionField(sub, 'type', type) || '-';
        const cooperation = getSubmissionField(sub, 'cooperation', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${position}</td>
            <td>${getCompanyTypeLabel(companyType)}</td>
            <td>${getCooperationLabel(cooperation)}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewPartnershipDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editPartnershipSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('合作洽谈表格数据加载完成');
}

// 查看合作洽谈详情
function viewPartnershipDetail(id) {
    console.log('查看合作洽谈详情，ID:', id);
    
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
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
    content.innerHTML = buildPartnershipDetailHTML(submission);
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('合作洽谈详情模态框已显示');
}

// 构建合作洽谈详情HTML
function buildPartnershipDetailHTML(submission) {
    const type = 'partnership';
    const status = submission.status || 'pending';
    
    // 获取字段值
    const name = getSubmissionField(submission, 'name', type) || '未知';
    const company = getSubmissionField(submission, 'company', type) || '-';
    const position = getSubmissionField(submission, 'position', type) || '-';
    const companyType = getSubmissionField(submission, 'type', type) || '-';
    const email = getSubmissionField(submission, 'email', type) || '-';
    const phone = getSubmissionField(submission, 'phone', type) || '-';
    const website = getSubmissionField(submission, 'website', type) || '-';
    const cooperation = getSubmissionField(submission, 'cooperation', type) || '-';
    const description = getSubmissionField(submission, 'description', type) || '';
    const expectation = getSubmissionField(submission, 'expectation', type) || '';
    const timestamp = submission.timestamp || '-';
    
    return `
        <div class="detail-container">
            <h2 class="detail-title">合作洽谈详情</h2>
            
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
                        <span class="detail-value">合作洽谈</span>
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
                        <span class="detail-label">公司类型：</span>
                        <span class="detail-value">${getCompanyTypeLabel(companyType)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">邮箱：</span>
                        <span class="detail-value">
                            ${email !== '-' ? `<a href="mailto:${email}" style="color: var(--primary-color); text-decoration: none;">${escapeHtml(email)}</a>` : email}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">手机：</span>
                        <span class="detail-value">
                            ${phone !== '-' ? `<a href="tel:${phone}" style="color: var(--primary-color); text-decoration: none;">${escapeHtml(phone)}</a>` : phone}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">公司网址：</span>
                        <span class="detail-value">
                            ${website !== '-' ? `<a href="${website}" target="_blank" style="color: var(--primary-color); text-decoration: none;">${escapeHtml(website)}</a>` : website}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>合作详情</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">合作类型：</span>
                        <span class="detail-value">${getCooperationLabel(cooperation)}</span>
                    </div>
                </div>
            </div>
            
            ${description ? `
            <div class="detail-card">
                <h3>公司及产品介绍</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(description)}
                    </pre>
                </div>
            </div>
            ` : ''}
            
            ${expectation ? `
            <div class="detail-card">
                <h3>合作期望</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(expectation)}
                    </pre>
                </div>
            </div>
            ` : ''}
            
            ${submission.notes ? `
            <div class="detail-card">
                <h3>处理备注</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(submission.notes)}
                    </pre>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// 编辑合作洽谈
function editPartnershipSubmission(id) {
    console.log('编辑合作洽谈，ID:', id);
    
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) return;
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-type').value = 'partnership';
    document.getElementById('edit-status').value = submission.status || 'pending';
    document.getElementById('edit-notes').value = submission.notes || '';
    
    document.getElementById('edit-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 加载其他咨询数据
function loadOtherSubmissions() {
    console.log('=== 加载其他咨询数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'other' || (s['other-name'] && !s.type && !s['consult-name'] && !s['wechat-name'] && !s['partner-name'])
    );
    
    console.log(`找到 ${submissions.length} 条其他咨询数据`);
    
    const tbody = document.getElementById('other-table-body');
    if (!tbody) {
        console.error('未找到其他咨询表格tbody元素');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                    暂无其他咨询数据
                </td>
            </tr>
        `;
        return;
    }
    
    submissions.forEach((sub, index) => {
        const status = sub.status || 'pending';
        const type = 'other';
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const category = getSubmissionField(sub, 'category', type) || '-';
        const subject = getSubmissionField(sub, 'subject', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sub.timestamp)}</td>
            <td>${name}</td>
            <td>${company}</td>
            <td>${getCategoryLabel(category)}</td>
            <td>${subject}</td>
            <td><span class="status-badge status-${status}">${getStatusLabel(status)}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="viewOtherDetail(${recordId})">
                    <span>👁️</span> 详情
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editOtherSubmission(${recordId})">
                    <span>✏️</span> 编辑
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('其他咨询表格数据加载完成');
}

// 查看其他咨询详情
function viewOtherDetail(id) {
    console.log('查看其他咨询详情，ID:', id);
    
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) {
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
    content.innerHTML = buildOtherDetailHTML(submission);
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('其他咨询详情模态框已显示');
}

// 构建其他咨询详情HTML
function buildOtherDetailHTML(submission) {
    const type = 'other';
    const status = submission.status || 'pending';
    
    // 获取字段值
    const name = getSubmissionField(submission, 'name', type) || '未知';
    const company = getSubmissionField(submission, 'company', type) || '-';
    const email = getSubmissionField(submission, 'email', type) || '-';
    const phone = getSubmissionField(submission, 'phone', type) || '-';
    const category = getSubmissionField(submission, 'category', type) || '-';
    const subject = getSubmissionField(submission, 'subject', type) || '-';
    const contentText = getSubmissionField(submission, 'content', type) || '';
    const timestamp = submission.timestamp || '-';
    
    return `
        <div class="detail-container">
            <h2 class="detail-title">其他咨询详情</h2>
            
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
                        <span class="detail-value">其他咨询</span>
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
                        <span class="detail-label">公司：</span>
                        <span class="detail-value">${escapeHtml(company)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">邮箱：</span>
                        <span class="detail-value">
                            ${email !== '-' ? `<a href="mailto:${email}" style="color: var(--primary-color); text-decoration: none;">${escapeHtml(email)}</a>` : email}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">手机：</span>
                        <span class="detail-value">
                            ${phone !== '-' ? `<a href="tel:${phone}" style="color: var(--primary-color); text-decoration: none;">${escapeHtml(phone)}</a>` : phone}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>咨询详情</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">咨询类别：</span>
                        <span class="detail-value">${getCategoryLabel(category)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">咨询主题：</span>
                        <span class="detail-value">${escapeHtml(subject)}</span>
                    </div>
                </div>
            </div>
            
            ${contentText ? `
            <div class="detail-card">
                <h3>咨询内容</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(contentText)}
                    </pre>
                </div>
            </div>
            ` : ''}
            
            ${submission.notes ? `
            <div class="detail-card">
                <h3>处理备注</h3>
                <div class="detail-text">
                    <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; padding: 0;">
${escapeHtml(submission.notes)}
                    </pre>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// 编辑其他咨询
function editOtherSubmission(id) {
    console.log('编辑其他咨询，ID:', id);
    
    const submissions = getAllSubmissions();
    const submission = submissions.find(s => s.id == id);
    
    if (!submission) return;
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-type').value = 'other';
    document.getElementById('edit-status').value = submission.status || 'pending';
    document.getElementById('edit-notes').value = submission.notes || '';
    
    document.getElementById('edit-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 微信咨询状态标签
function getWechatStatusLabel(status) {
    const labels = {
        'pending': '待处理',
        'contacted': '已联系',
        'added': '已添加',
        'cancelled': '已取消'
    };
    return labels[status] || status;
}

// 合作洽谈状态标签
function getPartnershipStatusLabel(status) {
    const labels = {
        'pending': '待处理',
        'contacted': '已联系',
        'negotiating': '洽谈中',
        'agreed': '已达成合作',
        'cancelled': '已取消'
    };
    return labels[status] || status;
}

// 其他咨询状态标签
function getOtherStatusLabel(status) {
    const labels = {
        'pending': '待处理',
        'replied': '已回复',
        'closed': '已关闭'
    };
    return labels[status] || status;
}

// 添加公司类型标签函数
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

// 微信咨询筛选功能（占位函数）
function filterWechatSubmissions() {
    console.log('微信咨询筛选功能开发中...');
    showNotification('筛选功能正在开发中', 'info');
}

function searchWechatSubmissions() {
    console.log('微信咨询搜索功能开发中...');
    showNotification('搜索功能正在开发中', 'info');
}

function prevWechatPage() {
    console.log('微信咨询上一页功能开发中...');
    showNotification('分页功能正在开发中', 'info');
}

function nextWechatPage() {
    console.log('微信咨询下一页功能开发中...');
    showNotification('分页功能正在开发中', 'info');
}

// 合作洽谈筛选功能（占位函数）
function filterPartnershipSubmissions() {
    console.log('合作洽谈筛选功能开发中...');
    showNotification('筛选功能正在开发中', 'info');
}

function searchPartnershipSubmissions() {
    console.log('合作洽谈搜索功能开发中...');
    showNotification('搜索功能正在开发中', 'info');
}

function prevPartnershipPage() {
    console.log('合作洽谈上一页功能开发中...');
    showNotification('分页功能正在开发中', 'info');
}

function nextPartnershipPage() {
    console.log('合作洽谈下一页功能开发中...');
    showNotification('分页功能正在开发中', 'info');
}

// 其他咨询筛选功能（占位函数）
function filterOtherSubmissions() {
    console.log('其他咨询筛选功能开发中...');
    showNotification('筛选功能正在开发中', 'info');
}

function searchOtherSubmissions() {
    console.log('其他咨询搜索功能开发中...');
    showNotification('搜索功能正在开发中', 'info');
}

function prevOtherPage() {
    console.log('其他咨询上一页功能开发中...');
    showNotification('分页功能正在开发中', 'info');
}

function nextOtherPage() {
    console.log('其他咨询下一页功能开发中...');
    showNotification('分页功能正在开发中', 'info');
}

// ========== 添加缺失的标签转换函数 ==========

// 微信咨询目的标签
function getPurposeLabel(purpose) {
    const labels = {
        'resource': '获取行业资源与报告',
        'consult': '业务咨询与合作',
        'community': '加入行业交流群',
        'other': '其他'
    };
    return labels[purpose] || purpose;
}

// 合作洽谈类型标签
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

// 公司类型标签
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

// 其他咨询类别标签
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

// ========== 修复数据加载函数 ==========

// 加载微信咨询数据
// 加载微信咨询数据
function loadWechatSubmissions() {
    console.log('=== 加载微信咨询数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'wechat' || (s['wechat-name'] && !s.type)
    );
    
    const tbody = document.getElementById('wechat-table-body');
    if (!tbody) {
        console.error('未找到微信咨询表格tbody元素');
        return;
    }
    
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
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const industry = getSubmissionField(sub, 'industry', type) || '-';
        const purpose = getSubmissionField(sub, 'purpose', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        
        // 添加 data-id 属性（用于批量操作）
        row.dataset.id = recordId;
        
        // 第一列：复选框
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // 绑定复选框事件
        checkbox.addEventListener('change', function() {
            // 更新行的高亮状态
            const row = this.closest('tr');
            const isSelected = this.checked;
            row.dataset.selected = isSelected;
            
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
            
            // 更新批量工具栏
            setTimeout(updateBatchToolbar, 10);
        });
        
        // 第二列：提交时间
        const timeCell = document.createElement('td');
        timeCell.textContent = formatDate(sub.timestamp);
        row.appendChild(timeCell);
        
        // 第三列：姓名
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        // 第四列：公司
        const companyCell = document.createElement('td');
        companyCell.textContent = company;
        row.appendChild(companyCell);
        
        // 第五列：职位
        const positionCell = document.createElement('td');
        positionCell.textContent = position;
        row.appendChild(positionCell);
        
        // 第六列：行业
        const industryCell = document.createElement('td');
        industryCell.textContent = getIndustryLabel(industry);
        row.appendChild(industryCell);
        
        // 第七列：添加目的
        const purposeCell = document.createElement('td');
        purposeCell.textContent = getPurposeLabel(purpose);
        row.appendChild(purposeCell);
        
        // 第八列：状态
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${status}">${getStatusLabel(status)}</span>`;
        row.appendChild(statusCell);
        
        // 第九列：操作按钮
        const actionCell = document.createElement('td');
        actionCell.className = 'action-buttons';
        actionCell.innerHTML = `
            <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                <span>👁️</span> 详情
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                <span>✏️</span> 编辑
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '微信咨询')" title="删除此记录">
                <span>🗑️</span> 删除
            </button>
        `;
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
    });
    
    // 更新批量工具栏状态
    setTimeout(() => {
        updateBatchToolbar();
    }, 100);
    
    console.log(`✅ 微信咨询数据加载完成，共 ${submissions.length} 条记录`);
}

// 加载合作洽谈数据
// 加载合作洽谈数据
function loadPartnershipSubmissions() {
    console.log('=== 加载合作洽谈数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'partnership' || (s['partner-name'] && !s.type)
    );
    
    const tbody = document.getElementById('partnership-table-body');
    if (!tbody) {
        console.error('未找到合作洽谈表格tbody元素');
        return;
    }
    
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
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const position = getSubmissionField(sub, 'position', type) || '-';
        const companyType = getSubmissionField(sub, 'type', type) || '-';
        const cooperation = getSubmissionField(sub, 'cooperation', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        
        // 添加 data-id 属性（用于批量操作）
        row.dataset.id = recordId;
        
        // 第一列：复选框
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // 绑定复选框事件
        checkbox.addEventListener('change', function() {
            // 更新行的高亮状态
            const row = this.closest('tr');
            const isSelected = this.checked;
            row.dataset.selected = isSelected;
            
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
            
            // 更新批量工具栏
            setTimeout(updateBatchToolbar, 10);
        });
        
        // 第二列：提交时间
        const timeCell = document.createElement('td');
        timeCell.textContent = formatDate(sub.timestamp);
        row.appendChild(timeCell);
        
        // 第三列：联系人
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        // 第四列：公司
        const companyCell = document.createElement('td');
        companyCell.textContent = company;
        row.appendChild(companyCell);
        
        // 第五列：职位
        const positionCell = document.createElement('td');
        positionCell.textContent = position;
        row.appendChild(positionCell);
        
        // 第六列：公司类型
        const companyTypeCell = document.createElement('td');
        companyTypeCell.textContent = getCompanyTypeLabel(companyType);
        row.appendChild(companyTypeCell);
        
        // 第七列：合作类型
        const cooperationCell = document.createElement('td');
        cooperationCell.textContent = getCooperationLabel(cooperation);
        row.appendChild(cooperationCell);
        
        // 第八列：状态
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${status}">${getStatusLabel(status)}</span>`;
        row.appendChild(statusCell);
        
        // 第九列：操作按钮
        const actionCell = document.createElement('td');
        actionCell.className = 'action-buttons';
        actionCell.innerHTML = `
            <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                <span>👁️</span> 详情
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                <span>✏️</span> 编辑
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '合作洽谈')" title="删除此记录">
                <span>🗑️</span> 删除
            </button>
        `;
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
    });
    
    // 更新批量工具栏状态
    setTimeout(() => {
        updateBatchToolbar();
    }, 100);
    
    console.log(`✅ 合作洽谈数据加载完成，共 ${submissions.length} 条记录`);
}

// 加载其他咨询数据
// 加载其他咨询数据
function loadOtherSubmissions() {
    console.log('=== 加载其他咨询数据 ===');
    
    const submissions = getAllSubmissions().filter(s => 
        s.type === 'other' || (s['other-name'] && !s.type)
    );
    
    const tbody = document.getElementById('other-table-body');
    if (!tbody) {
        console.error('未找到其他咨询表格tbody元素');
        return;
    }
    
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
        
        // 获取字段值
        const name = getSubmissionField(sub, 'name', type) || '-';
        const company = getSubmissionField(sub, 'company', type) || '-';
        const category = getSubmissionField(sub, 'category', type) || '-';
        const subject = getSubmissionField(sub, 'subject', type) || '-';
        const recordId = sub.id || Date.now();
        
        const row = document.createElement('tr');
        
        // 添加 data-id 属性（用于批量操作）
        row.dataset.id = recordId;
        
        // 第一列：复选框
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // 绑定复选框事件
        checkbox.addEventListener('change', function() {
            // 更新行的高亮状态
            const row = this.closest('tr');
            const isSelected = this.checked;
            row.dataset.selected = isSelected;
            
            if (isSelected) {
                row.classList.add('selected-row');
            } else {
                row.classList.remove('selected-row');
            }
            
            // 更新批量工具栏
            setTimeout(updateBatchToolbar, 10);
        });
        
        // 第二列：提交时间
        const timeCell = document.createElement('td');
        timeCell.textContent = formatDate(sub.timestamp);
        row.appendChild(timeCell);
        
        // 第三列：联系人
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        // 第四列：公司
        const companyCell = document.createElement('td');
        companyCell.textContent = company;
        row.appendChild(companyCell);
        
        // 第五列：咨询类别
        const categoryCell = document.createElement('td');
        categoryCell.textContent = getCategoryLabel(category);
        row.appendChild(categoryCell);
        
        // 第六列：咨询主题
        const subjectCell = document.createElement('td');
        subjectCell.textContent = subject;
        row.appendChild(subjectCell);
        
        // 第七列：状态
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${status}">${getStatusLabel(status)}</span>`;
        row.appendChild(statusCell);
        
        // 第八列：操作按钮
        const actionCell = document.createElement('td');
        actionCell.className = 'action-buttons';
        actionCell.innerHTML = `
            <button class="btn btn-sm btn-primary" onclick="viewDetail(${recordId})">
                <span>👁️</span> 详情
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editSubmission(${recordId})">
                <span>✏️</span> 编辑
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete(${recordId}, '其他咨询')" title="删除此记录">
                <span>🗑️</span> 删除
            </button>
        `;
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
    });
    
    // 更新批量工具栏状态
    setTimeout(() => {
        updateBatchToolbar();
    }, 100);
    
    console.log(`✅ 其他咨询数据加载完成，共 ${submissions.length} 条记录`);
}

// ========== 分页信息更新函数 ==========

function updateWechatPageInfo() {
    const infoElement = document.getElementById('wechat-page-info');
    if (infoElement) {
        const submissions = getAllSubmissions().filter(s => 
            s.type === 'wechat' || s['wechat-name']
        );
        infoElement.textContent = `第1页，共${Math.ceil(submissions.length / 10)}页`;
    }
}

function updatePartnershipPageInfo() {
    const infoElement = document.getElementById('partnership-page-info');
    if (infoElement) {
        const submissions = getAllSubmissions().filter(s => 
            s.type === 'partnership' || s['partner-name']
        );
        infoElement.textContent = `第1页，共${Math.ceil(submissions.length / 10)}页`;
    }
}

function updateOtherPageInfo() {
    const infoElement = document.getElementById('other-page-info');
    if (infoElement) {
        const submissions = getAllSubmissions().filter(s => 
            s.type === 'other' || s['other-name']
        );
        infoElement.textContent = `第1页，共${Math.ceil(submissions.length / 10)}页`;
    }
}

// ========== 添加测试数据函数 ==========

function createTestData() {
    console.log('=== 创建测试数据 ===');
    
    const testData = [
        {
            id: Date.now(),
            type: 'wechat',
            timestamp: new Date().toLocaleString('zh-CN'),
            'name': '张三',
            'company': '测试水泥公司',
            'position': '安全经理',
            'industry': 'cement',
            'purpose': 'resource',
            'email': 'zhangsan@example.com',
            'phone': '13800138001',
            'wechat-account': 'zhangsan_wechat',
            status: 'pending'
        },
        {
            id: Date.now() + 1,
            type: 'partnership',
            timestamp: new Date(Date.now() - 86400000).toLocaleString('zh-CN'),
            'name': '李四',
            'company': '安全设备供应商',
            'position': '销售总监',
            'type': 'hardware',
            'cooperation': 'supplier',
            'email': 'lisi@example.com',
            'phone': '13800138002',
            'description': '提供高质量的安全监控设备',
            status: 'contacted'
        },
        {
            id: Date.now() + 2,
            type: 'other',
            timestamp: new Date(Date.now() - 172800000).toLocaleString('zh-CN'),
            'name': '王五',
            'company': '某咨询公司',
            'category': 'speech',
            'subject': '邀请演讲',
            'email': 'wangwu@example.com',
            'phone': '13800138003',
            'content': '邀请在行业论坛上发表演讲',
            status: 'pending'
        }
    ];
    
    // 获取现有数据
    let existingData = [];
    const stored = localStorage.getItem('cement_submissions');
    if (stored) {
        existingData = JSON.parse(stored);
    }
    
    // 添加测试数据
    existingData = [...testData, ...existingData];
    
    // 保存到localStorage
    localStorage.setItem('cement_submissions', JSON.stringify(existingData));
    
    console.log('✅ 测试数据已创建，总数据量:', existingData.length);
    
    // 刷新页面数据
    if (document.getElementById('wechat').classList.contains('active')) {
        loadWechatSubmissions();
    } else if (document.getElementById('partnership').classList.contains('active')) {
        loadPartnershipSubmissions();
    } else if (document.getElementById('other').classList.contains('active')) {
        loadOtherSubmissions();
    }
    
    // 更新计数
    updateCounts();
}

// ========== 确保函数全局可用 ==========
window.loadWechatSubmissions = loadWechatSubmissions;
window.loadPartnershipSubmissions = loadPartnershipSubmissions;
window.loadOtherSubmissions = loadOtherSubmissions;
window.createTestData = createTestData;
window.prevWechatPage = function() {
    console.log('微信咨询上一页');
    showNotification('分页功能开发中', 'info');
};
window.nextWechatPage = function() {
    console.log('微信咨询下一页');
    showNotification('分页功能开发中', 'info');
};
window.prevPartnershipPage = function() {
    console.log('合作洽谈上一页');
    showNotification('分页功能开发中', 'info');
};
window.nextPartnershipPage = function() {
    console.log('合作洽谈下一页');
    showNotification('分页功能开发中', 'info');
};
window.prevOtherPage = function() {
    console.log('其他咨询上一页');
    showNotification('分页功能开发中', 'info');
};
window.nextOtherPage = function() {
    console.log('其他咨询下一页');
    showNotification('分页功能开发中', 'info');
};

// 显示通知
function showNotification(message, type = 'info') {
    console.log(`${type}: ${message}`);
    
    // 创建一个简单的通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动移除
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

// ========== 图表绘制功能 ==========

// 初始化图表
let submissionChart = null;
let typeChart = null;

// 绘制提交趋势图
function drawSubmissionChart() {
    console.log('开始绘制提交趋势图');
    
    const canvas = document.getElementById('submission-chart');
    const loading = document.getElementById('submission-loading');
    
    if (!canvas) {
        console.error('未找到提交趋势图表容器');
        return;
    }
    
    // 显示加载状态
    if (loading) loading.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    
    // 获取最近30天的数据
    const submissions = getAllSubmissions();
    
    // 计算最近30天每天的提交量
    const last30Days = getLast30DaysData(submissions);
    const dates = last30Days.map(day => day.date);
    const counts = last30Days.map(day => day.count);
    
    // 如果之前有图表实例，销毁它
    if (submissionChart) {
        submissionChart.destroy();
        submissionChart = null;
    }
    
    try {
        // 获取canvas上下文
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法获取canvas绘图上下文');
        }
        
        // 创建新图表
        submissionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '每日提交量',
                    data: counts,
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
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
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
        
        // 隐藏加载状态，显示图表
        if (loading) loading.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        
        console.log('提交趋势图绘制完成');
    } catch (error) {
        console.error('绘制提交趋势图失败:', error);
        if (loading) {
            loading.innerHTML = `
                <div style="color: #f44336; text-align: center; padding: 20px;">
                    <p>图表加载失败</p>
                    <p style="font-size: 12px; color: #999;">${error.message}</p>
                    <button onclick="drawSubmissionChart()" style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        重试
                    </button>
                </div>
            `;
        }
    }
}

// 绘制咨询类型分布图
function drawTypeChart() {
    console.log('开始绘制咨询类型分布图');
    
    const canvas = document.getElementById('type-chart');
    const loading = document.getElementById('type-loading');
    
    if (!canvas) {
        console.error('未找到咨询类型分布图表容器');
        return;
    }
    
    // 显示加载状态
    if (loading) loading.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    
    // 获取所有数据
    const submissions = getAllSubmissions();
    
    // 统计各类型数量（修复类型统计）
    const typeCounts = {
        consultation: 0,
        wechat: 0,
        partnership: 0,
        other: 0,
        unknown: 0
    };
    
    submissions.forEach(sub => {
        const type = sub.type || 'unknown';
        
        // 标准化类型
        let normalizedType = 'other';
        if (type === 'consultation' || type.includes('consult')) {
            normalizedType = 'consultation';
        } else if (type === 'wechat' || type.includes('wechat')) {
            normalizedType = 'wechat';
        } else if (type === 'partnership' || type.includes('partner')) {
            normalizedType = 'partnership';
        } else if (type === 'other') {
            normalizedType = 'other';
        } else {
            // 其他类型如 'hardware', 'software' 归为 unknown
            normalizedType = 'unknown';
        }
        
        typeCounts[normalizedType]++;
    });
    
    // 准备图表数据
    const labels = [];
    const data = [];
    const colors = [];
    
    // 只添加有数据的类型
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
    
    if (typeCounts.unknown > 0) {
        labels.push('未知类型');
        data.push(typeCounts.unknown);
        colors.push('rgba(241, 196, 15, 0.8)');
    }
    
    // 如果之前有图表实例，销毁它
    if (typeChart) {
        typeChart.destroy();
        typeChart = null;
    }
    
    // 如果没有数据，显示提示
    if (data.length === 0) {
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>暂无数据</p>
                    <button onclick="createComprehensiveTestData()" style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        生成测试数据
                    </button>
                </div>
            `;
        }
        return;
    }
    
    try {
        // 获取canvas上下文
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法获取canvas绘图上下文');
        }
        
        // 创建新图表
        typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        // 隐藏加载状态，显示图表
        if (loading) loading.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        
        console.log('咨询类型分布图绘制完成');
    } catch (error) {
        console.error('绘制咨询类型分布图失败:', error);
        if (loading) {
            loading.innerHTML = `
                <div style="color: #f44336; text-align: center; padding: 20px;">
                    <p>图表加载失败</p>
                    <p style="font-size: 12px; color: #999;">${error.message}</p>
                    <button onclick="drawTypeChart()" style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        重试
                    </button>
                </div>
            `;
        }
    }
}

// 获取最近30天数据
function getLast30DaysData(submissions) {
    const result = [];
    const today = new Date();
    
    // 生成最近30天的日期
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDateShort(date);
        
        result.push({
            date: dateStr,
            count: 0
        });
    }
    
    // 统计每天的提交量
    submissions.forEach(sub => {
        if (!sub.timestamp) return;
        
        const subDate = new Date(sub.timestamp);
        const subDateStr = formatDateShort(subDate);
        
        // 检查是否是最近30天内的数据
        const dayIndex = result.findIndex(day => day.date === subDateStr);
        if (dayIndex !== -1) {
            result[dayIndex].count++;
        }
    });
    
    return result;
}

// 格式化日期为短格式 (MM/DD)
function formatDateShort(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
}

// 更新统计数据
function updateStats() {
    console.log('更新统计数据');
    
    const submissions = getAllSubmissions();
    const total = submissions.length;
    
    // 计算今日新增
    const today = new Date().toLocaleDateString('zh-CN');
    const todayCount = submissions.filter(sub => {
        if (!sub.timestamp) return false;
        const subDate = new Date(sub.timestamp).toLocaleDateString('zh-CN');
        return subDate === today;
    }).length;
    
    // 计算昨日新增（用于对比）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('zh-CN');
    const yesterdayCount = submissions.filter(sub => {
        if (!sub.timestamp) return false;
        const subDate = new Date(sub.timestamp).toLocaleDateString('zh-CN');
        return subDate === yesterdayStr;
    }).length;
    
    // 计算转化率（假设有10%的咨询转化为付费客户）
    const conversionRate = submissions.length > 0 ? '12%' : '0%';
    
    // 计算平均响应时间（模拟数据）
    const avgResponseTime = submissions.length > 0 ? '2.5h' : '0h';
    
    // 更新UI
    document.getElementById('total-submissions').textContent = total;
    document.getElementById('today-submissions').textContent = todayCount;
    document.getElementById('conversion-rate').textContent = conversionRate;
    document.getElementById('avg-response-time').textContent = avgResponseTime;
    
    // 更新今日新增对比
    const todayChange = document.querySelector('#today-submissions + .stat-change');
    if (todayChange) {
        const changeValue = todayCount - yesterdayCount;
        const changeElement = todayChange.querySelector('.change-up, .change-down');
        
        if (changeElement) {
            changeElement.textContent = changeValue >= 0 ? `↑ ${changeValue}` : `↓ ${Math.abs(changeValue)}`;
            changeElement.className = changeValue >= 0 ? 'change-up' : 'change-down';
        }
    }
    
    console.log('统计数据更新完成');
}

// 加载统计数据和图表
function loadStats() {
    console.log('=== 加载统计数据 ===');
    
    updateStats();
    updateCounts();
    
    // 延迟绘制图表，确保DOM已加载
    setTimeout(() => {
        try {
            drawSubmissionChart();
            drawTypeChart();
            console.log('✅ 图表绘制完成');
        } catch (error) {
            console.error('图表绘制失败:', error);
            // 如果图表绘制失败，显示占位符
            const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
            chartPlaceholders.forEach(placeholder => {
                placeholder.innerHTML = `<div style="text-align: center; padding: 40px; color: #999;">
                    <p>图表加载失败</p>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">刷新页面</button>
                </div>`;
            });
        }
    }, 500);
}

// 在页面切换时重绘图表
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
        case 'export':
            loadExportSection();
            break;
        case 'dashboard':
            loadStats();  // 这会加载图表
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

// 调整图表容器大小
function resizeCharts() {
    if (submissionChart) {
        submissionChart.resize();
    }
    if (typeChart) {
        typeChart.resize();
    }
}

// 监听窗口大小变化
window.addEventListener('resize', resizeCharts);

// 在页面加载时初始化图表
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
    
    // 测试数据按钮
    const testDataBtn = document.getElementById('add-test-data');
    if (testDataBtn) {
        testDataBtn.addEventListener('click', function() {
            if (confirm('确定要添加测试数据吗？这会覆盖现有数据。')) {
                createInstantTestData();
            }
        });
    }
    
    // 初始化模态框事件
    initModalEvents();
    
    console.log('✅ 事件监听器已设置');
    
    // 如果直接进入管理页面，检查是否需要加载图表
    if (document.getElementById('dashboard-page').style.display !== 'none') {
        setTimeout(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                loadStats();
            }
        }, 1000);
    }
});



// 创建综合测试数据
function createComprehensiveTestData() {
    console.log('=== 创建综合测试数据 ===');
    
    const testData = [];
    const today = new Date();
    
    // 创建最近30天的随机数据
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // 随机生成每天的数据量（0-5条）
        const dailyCount = Math.floor(Math.random() * 6);
        
        for (let j = 0; j < dailyCount; j++) {
            // 随机选择咨询类型
            const types = ['consultation', 'wechat', 'partnership', 'other'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            // 随机时间（同一天内）
            const randomHour = Math.floor(Math.random() * 24);
            const randomMinute = Math.floor(Math.random() * 60);
            const submissionDate = new Date(date);
            submissionDate.setHours(randomHour, randomMinute, 0);
            
            // 创建测试记录
            const record = {
                id: Date.now() + testData.length,
                type: randomType,
                timestamp: submissionDate.toLocaleString('zh-CN'),
                status: 'pending',
                name: `测试用户${testData.length + 1}`,
                company: `测试公司${Math.floor(Math.random() * 10) + 1}`,
                email: `test${testData.length + 1}@example.com`,
                phone: `13800${Math.floor(100000 + Math.random() * 900000)}`
            };
            
            // 根据类型添加特定字段
            switch(randomType) {
                case 'consultation':
                    record['position'] = '安全经理';
                    record['industry'] = 'cement';
                    record['service'] = 'diagnosis';
                    record['time'] = 'afternoon';
                    break;
                case 'wechat':
                    record['position'] = '技术主管';
                    record['industry'] = 'concrete';
                    record['purpose'] = 'resource';
                    break;
                case 'partnership':
                    record['position'] = '销售总监';
                    record['type'] = 'software';
                    record['cooperation'] = 'supplier';
                    break;
                case 'other':
                    record['category'] = 'product';
                    record['subject'] = '产品咨询';
                    break;
            }
            
            testData.push(record);
        }
    }
    
    // 获取现有数据（如果有的话）
    let existingData = [];
    try {
        const stored = localStorage.getItem('cement_submissions');
        if (stored) {
            existingData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('解析现有数据失败:', error);
    }
    
    // 合并数据
    const combinedData = [...testData, ...existingData];
    
    // 保存到localStorage
    try {
        localStorage.setItem('cement_submissions', JSON.stringify(combinedData));
        console.log(`✅ 综合测试数据已创建，总数据量: ${combinedData.length}`);
        
        // 显示成功消息
        showNotification('综合测试数据已创建，包含最近30天的随机数据', 'success');
        
        // 刷新当前页面
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
}



// 清理和修复数据中的类型字段
function fixDataTypes() {
    console.log('=== 修复数据类型 ===');
    
    const submissions = getAllSubmissions();
    let fixedCount = 0;
    
    const fixedSubmissions = submissions.map(sub => {
        const originalType = sub.type;
        
        // 如果类型不在有效类型中，进行修复
        const validTypes = ['consultation', 'wechat', 'partnership', 'other'];
        
        if (!validTypes.includes(originalType)) {
            // 根据字段名推断类型
            let newType = 'other';
            
            if (originalType === 'hardware' || originalType === 'software' || 
                originalType === 'service' || originalType === 'consulting' ||
                originalType === 'institution') {
                // 这些都是合作洽谈的公司类型，应归类为 partnership
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
    
    // 保存修复后的数据
    if (fixedCount > 0) {
        localStorage.setItem('cement_submissions', JSON.stringify(fixedSubmissions));
        console.log(`✅ 修复了 ${fixedCount} 条数据的类型字段`);
        return true;
    } else {
        console.log('✅ 数据类型正常，无需修复');
        return false;
    }
}

// 在 loadStats 函数开始时调用修复函数
function loadStats() {
    console.log('=== 加载统计数据 ===');
    
    // 先修复数据类型
    const wasFixed = fixDataTypes();
    
    updateStats();
    updateCounts();
    
    // 延迟绘制图表，确保DOM已加载
    setTimeout(() => {
        try {
            drawSubmissionChart();
            drawTypeChart();
            console.log('✅ 图表绘制完成');
            
            if (wasFixed) {
                showNotification('已自动修复数据中的类型字段', 'success');
            }
        } catch (error) {
            console.error('图表绘制失败:', error);
            // 如果图表绘制失败，显示占位符
            const chartPlaceholders = document.querySelectorAll('.chart-loading');
            chartPlaceholders.forEach(loading => {
                loading.innerHTML = `<div style="text-align: center; padding: 40px; color: #999;">
                    <p>图表加载失败: ${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        刷新页面
                    </button>
                </div>`;
            });
        }
    }, 500);
}

// ==================== 密码修改功能 ====================

// ==================== 安全密码处理核心函数 ====================

// ==================== 【修复版】安全密码处理核心函数 ====================

/**
 * 生成密码的安全哈希值 (使用稳定的SHA256)
 * @param {string} password - 明文密码
 * @return {string} 十六进制哈希字符串
 */
function securePasswordHash(password) {
    // 确保CryptoJS库已加载，并执行一次稳定的SHA256计算
    if (typeof CryptoJS === 'undefined') {
        console.error('❌ CryptoJS 库未加载！');
        // 紧急回退方案：如果库加载失败，使用一个简单的稳定哈希（仅用于诊断）
        return 'error_crypto_not_loaded';
    }
    try {
        // 核心修复：直接调用，确保每次结果相同
        const hash = CryptoJS.SHA256(password);
        const hashString = hash.toString(CryptoJS.enc.Hex);
        console.log(`[securePasswordHash] 密码 "${password}" -> 哈希: ${hashString.substring(0, 16)}...`);
        return hashString;
    } catch (error) {
        console.error('❌ securePasswordHash 执行失败:', error);
        return 'error_hash_failed';
    }
}

/**
 * 验证密码是否匹配 (修复版)
 * @param {string} inputPassword - 用户输入的密码
 * @param {string} storedHash - 存储的密码哈希值
 * @return {boolean} 匹配结果
 */
function verifyPassword(inputPassword, storedHash) {
    const inputHash = securePasswordHash(inputPassword);
    const isMatch = (inputHash === storedHash);
    console.log(`[verifyPassword] 比对: ${inputHash.substring(0, 16)}... === ${storedHash.substring(0, 16)}... ? ${isMatch}`);
    return isMatch;
}

/**
 * 处理登录（已集成安全哈希验证）
 */
function handleLogin(e) {
    e.preventDefault();
    console.log('=== 安全登录流程开始 ===');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // 1. 验证用户名
    if (username !== 'admin') {
        showNotification('用户名错误，请使用 admin', 'error');
        return;
    }

    // 2. 获取存储的哈希（兼容新旧系统）
    const storedHash = localStorage.getItem('admin_password_hash');
    const defaultPassword = 'AnHuan2024';
    let isAuthenticated = false;

    // 3. 进行密码验证
    if (storedHash) {
        // 情况A：系统已有存储的哈希值
        console.log('验证: 使用存储的哈希值比对...');
        isAuthenticated = verifyPassword(password, storedHash);
        
        // 向后兼容：如果用户从未修改过密码，其存储的哈希可能是由旧simpleHash生成的
        // 如果新算法验证失败，尝试用旧算法验证一次（仅用于迁移兼容）
        if (!isAuthenticated) {
            console.log('SHA256验证失败，尝试旧哈希兼容验证...');
            const oldHash = localStorage.getItem('admin_password_old_hash');
            if (oldHash && simpleHash(password) === oldHash) {
                isAuthenticated = true;
                // 自动升级：将旧哈希迁移为新的安全哈希
                localStorage.setItem('admin_password_hash', securePasswordHash(password));
                localStorage.removeItem('admin_password_old_hash');
                console.log('✅ 检测到旧密码哈希，已自动升级为SHA256存储。');
            }
        }
    } else {
        // 情况B：全新系统，使用默认密码验证
        console.log('验证: 全新系统，使用默认密码验证...');
        isAuthenticated = (password === defaultPassword);
        // 首次登录成功，立即将默认密码哈希后存储，提升安全性
        if (isAuthenticated) {
            localStorage.setItem('admin_password_hash', securePasswordHash(defaultPassword));
            console.log('✅ 首次登录，默认密码哈希已安全存储。');
        }
    }

    // 4. 处理验证结果
    if (isAuthenticated) {
        console.log('✅ 身份验证通过');
        const authData = {
            username: username,
            timestamp: Date.now(),
            remember: remember
        };
        localStorage.setItem('admin_auth', JSON.stringify(authData));
        showNotification('登录成功！', 'success');
        switchToDashboard(username);
    } else {
        console.log('❌ 身份验证失败');
        let errorMsg = '密码错误';
        errorMsg += storedHash ? '，请使用您设置的新密码' : '，默认密码为 AnHuan2024';
        showNotification(errorMsg, 'error');
        document.getElementById('password').value = ''; // 清空密码框
    }
}

/**
 * 处理密码修改（已集成安全哈希）
 */
function handlePasswordChange(e) {
    e.preventDefault();
    console.log('=== 安全密码修改流程开始 ===');

    const currentPass = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    // 1. 基础验证
    if (!currentPass || !newPass || !confirmPass) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        showNotification('两次输入的新密码不一致', 'error');
        return;
    }
    if (newPass.length < 8) { // 建议提高最小长度要求
        showNotification('新密码长度至少为8位', 'error');
        return;
    }

    // 2. 验证当前密码
    const storedHash = localStorage.getItem('admin_password_hash');
    const defaultPassword = 'AnHuan2024';
    let isCurrentPasswordValid = false;

    if (storedHash) {
        // 使用安全哈希验证
        isCurrentPasswordValid = verifyPassword(currentPass, storedHash);
    } else {
        // 用户从未修改过密码，验证默认密码
        isCurrentPasswordValid = (currentPass === defaultPassword);
    }

    if (!isCurrentPasswordValid) {
        showNotification('当前密码输入错误', 'error');
        return;
    }

    // 3. 保存新密码（使用安全哈希）
    const newPasswordHash = securePasswordHash(newPass);
    localStorage.setItem('admin_password_hash', newPasswordHash);
    
    // 清理可能存在的旧哈希（确保一致性）
    localStorage.removeItem('admin_password_old_hash');
    
    console.log('✅ 新密码已使用SHA256哈希安全存储');

    // 4. 提示成功
    showNotification('密码修改成功！请重新登录。', 'success');
    closeChangePasswordModal();

    // 5. 安全建议：延迟后提示重新登录
    setTimeout(() => {
        if (confirm('密码已成功修改。为保障账户安全，建议立即重新登录。是否现在登出？')) {
            handleLogout();
        }
    }, 1000);
}

/**
 * 【可选】保留旧的哈希函数，仅用于系统迁移期间的兼容性验证
 * 在确保所有用户密码都已升级为新哈希后，可删除此函数
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// 在DOM加载完成后，确保更新了事件绑定（替换旧的绑定）
document.addEventListener('DOMContentLoaded', function() {
    // ... 你原有的其他初始化代码 ...

    // 重新绑定使用新安全逻辑的登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // 先移除旧监听器，再添加新监听器
        loginForm.removeEventListener('submit', handleLogin); // 尝试移除旧的
        loginForm.addEventListener('submit', handleLogin); // 添加新的
        console.log('✅ 安全登录事件监听器已更新');
    }
    
    // 确保密码修改表单也使用新逻辑
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.removeEventListener('submit', handlePasswordChange);
        passwordForm.addEventListener('submit', handlePasswordChange);
        console.log('✅ 安全密码修改事件监听器已更新');
    }
});

// 初始化密码修改功能
function initPasswordChange() {
    console.log('初始化密码修改功能...');
    
    // 1. 在用户区域添加修改密码按钮
    const navUser = document.querySelector('.nav-user');
    if (navUser && !document.getElementById('change-password-btn')) {
        const changePassBtn = document.createElement('button');
        changePassBtn.id = 'change-password-btn';
        changePassBtn.className = 'btn btn-secondary';
        changePassBtn.innerHTML = '🔑 修改密码';
        changePassBtn.style.marginRight = '10px';
        
        // 插入到登出按钮之前
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            navUser.insertBefore(changePassBtn, logoutBtn);
        } else {
            navUser.appendChild(changePassBtn);
        }
        
        // 绑定点击事件
        changePassBtn.addEventListener('click', openChangePasswordModal);
    }
    
    // 2. 绑定密码修改表单提交事件
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
        
        // 绑定实时密码强度检查
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', checkPasswordStrength);
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        }
    }
    
    // 3. 绑定模态框关闭事件
    const passwordModal = document.getElementById('change-password-modal');
    if (passwordModal) {
        const closeBtn = passwordModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeChangePasswordModal);
        }
        
        // 点击模态框外部关闭
        passwordModal.addEventListener('click', function(e) {
            if (e.target === passwordModal) {
                closeChangePasswordModal();
            }
        });
    }
    
    console.log('✅ 密码修改功能初始化完成');
}

// 打开密码修改模态框
function openChangePasswordModal() {
    console.log('打开密码修改模态框');
    
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 清空表单
        const form = document.getElementById('change-password-form');
        if (form) form.reset();
        
        // 重置提示信息
        resetPasswordHints();
        
        // 焦点设置到当前密码输入框
        setTimeout(() => {
            const currentPassInput = document.getElementById('current-password');
            if (currentPassInput) currentPassInput.focus();
        }, 100);
    }
}

// 关闭密码修改模态框
function closeChangePasswordModal() {
    console.log('关闭密码修改模态框');
    
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 检查密码强度
function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthBar = document.querySelector('.strength-bar');
    const segments = document.querySelectorAll('.strength-segment');
    const strengthLabel = document.getElementById('strength-label');
    
    if (!password) {
        // 重置显示
        segments.forEach(seg => {
            seg.style.backgroundColor = '#e9ecef';
        });
        if (strengthLabel) strengthLabel.textContent = '无';
        if (strengthLabel) strengthLabel.style.color = '#6c757d';
        return;
    }
    
    let strength = 0;
    
    // 长度检查
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    
    // 复杂度检查
    if (/[A-Z]/.test(password)) strength += 1; // 有大写字母
    if (/[0-9]/.test(password)) strength += 1; // 有数字
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // 有特殊字符
    
    // 更新强度指示器
    segments.forEach((seg, index) => {
        if (index < strength) {
            // 根据强度设置颜色
            if (strength <= 2) {
                seg.style.backgroundColor = '#dc3545'; // 弱 - 红色
            } else if (strength <= 4) {
                seg.style.backgroundColor = '#ffc107'; // 中 - 黄色
            } else {
                seg.style.backgroundColor = '#28a745'; // 强 - 绿色
            }
        } else {
            seg.style.backgroundColor = '#e9ecef';
        }
    });
    
    // 更新标签文本
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

// 检查密码是否匹配
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

// 重置所有密码提示
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


// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 将此行添加到现有的DOMContentLoaded事件处理函数中
    // 放在其他初始化函数调用之后
    setTimeout(() => {
        initPasswordChange();
    }, 500);
});


/**
 * 刷新当前活动页面的数据
 * 这个函数应该已经存在，如果不存在就创建它
 */
function refreshCurrentPage() {
    console.log('刷新当前页面数据...');
    
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) {
        console.error('未找到活动页面');
        return;
    }
    
    const sectionId = activeSection.id;
    console.log('当前活动页面:', sectionId);
    
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
        default:
            console.log('未知页面，刷新仪表板');
            loadStats();
            loadRecentSubmissions();
    }
    
    // 总是更新计数器
    updateCounts();
    
    // 隐藏批量操作工具栏（如果可见）
    document.getElementById('batch-toolbar').style.display = 'none';
    
    console.log('✅ 页面刷新完成');
}

// 使函数全局可用
window.refreshCurrentPage = refreshCurrentPage;

// ==================== 数据删除功能 ====================



// 全局变量用于删除操作
let deleteQueue = {
    type: '',           // 数据类型
    ids: [],            // 要删除的ID数组
    records: [],        // 备份的被删除记录（用于撤销）
    isBatch: false      // 是否为批量删除
};

// 最近删除记录（用于撤销）
let lastDeletedRecords = [];
const UNDO_TIMEOUT = 10000; // 撤销超时时间10秒

// 1. 初始化删除功能
function initDeleteFunction() {
    console.log('初始化删除功能...');
    
    // 为现有表格添加复选框（批量选择）
    addCheckboxesToTables();
    
    // 绑定全局事件
    bindDeleteEvents();
    
    console.log('✅ 删除功能初始化完成');
}

// 2. 为表格添加复选框列
function addCheckboxesToTables() {
    const tables = ['consultation', 'wechat', 'partnership', 'other'];
    
    tables.forEach(tableType => {
        const table = document.querySelector(`#${tableType}-table-body`);
        if (!table) return;
        
        // 添加表头复选框
        const headerRow = table.closest('table').querySelector('thead tr');
        if (headerRow && !headerRow.querySelector('th:first-child input[type="checkbox"]')) {
            const selectAllTh = document.createElement('th');
            selectAllTh.innerHTML = '<input type="checkbox" onclick="toggleSelectAll(this)">';
            headerRow.insertBefore(selectAllTh, headerRow.firstChild);
        }
    });
}

// 3. 绑定删除相关事件
function bindDeleteEvents() {
    // ESC键关闭删除模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDeleteModal();
        }
    });
    
    // 点击模态框外部关闭
    const deleteModal = document.getElementById('delete-confirm-modal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }
}

// 4. 单条删除确认
// 单条删除确认函数优化
function confirmDelete(id, typeName) {
    const submissions = getAllSubmissions();
    // 确保ID类型一致
    const recordId = id ? id.toString() : '';
    const record = submissions.find(s => s.id && s.id.toString() === recordId);
    
    if (!record) {
        showNotification('未找到要删除的记录', 'error');
        return;
    }
    
    // 设置删除队列
    deleteQueue = {
        type: record.type || 'consultation',
        ids: [recordId],  // 使用字符串
        records: [record],
        isBatch: false
    };
    
    // 构建确认消息
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
    
    // 显示确认模态框
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}



// 5. 批量选择功能
// 全选/取消全选 - 增强版本
function toggleSelectAll(checkbox) {
    const table = checkbox.closest('table');
    if (!table) {
        console.error('未找到表格');
        return;
    }
    
    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('未找到表格体');
        return;
    }
    
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
    const isChecked = checkbox.checked;
    
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        
        // 触发change事件
        const event = new Event('change');
        cb.dispatchEvent(event);
    });
    
    console.log(`${isChecked ? '全选' : '取消全选'}，影响了 ${checkboxes.length} 个复选框`);
    
    // 更新批量工具栏
    updateBatchToolbar();
}

// 6. 更新批量操作工具栏
// 更新批量工具栏 - 增强版本
function updateBatchToolbar() {
    console.log('更新批量工具栏...');
    
    // 获取当前活动页面
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) {
        console.log('没有活动页面，隐藏工具栏');
        document.getElementById('batch-toolbar').style.display = 'none';
        return;
    }
    
    // 根据活动页面找到对应的表格
    const tableIdMap = {
        'consultations': 'consultation-table-body',
        'wechat': 'wechat-table-body',
        'partnership': 'partnership-table-body',
        'other': 'other-table-body'
    };
    
    const tableId = tableIdMap[activeSection.id];
    if (!tableId) {
        console.log('当前页面不支持批量操作:', activeSection.id);
        document.getElementById('batch-toolbar').style.display = 'none';
        return;
    }
    
    const table = document.getElementById(tableId);
    if (!table) {
        console.log('表格未找到:', tableId);
        document.getElementById('batch-toolbar').style.display = 'none';
        return;
    }
    
    // 计算选中的复选框数量
    const checkedBoxes = table.querySelectorAll('input[type="checkbox"]:checked');
    const checkedCount = checkedBoxes.length;
    
    console.log(`在表格 ${tableId} 中选中了 ${checkedCount} 个复选框`);
    
    const toolbar = document.getElementById('batch-toolbar');
    const countElement = document.getElementById('selected-count');
    
    if (!toolbar || !countElement) {
        console.error('批量工具栏元素未找到');
        return;
    }
    
    if (checkedCount > 0) {
        // 显示批量工具栏
        countElement.textContent = checkedCount;
        toolbar.style.display = 'flex';
        toolbar.style.visibility = 'visible';
        toolbar.style.opacity = '1';
        
        console.log('✅ 批量工具栏已显示，选中数量:', checkedCount);
    } else {
        // 隐藏批量工具栏
        toolbar.style.display = 'none';
        console.log('批量工具栏已隐藏');
    }
}

// 7. 批量删除确认
// 7. 批量删除确认
// 批量删除确认 - 增强版本
function batchDeleteConfirm() {
    console.log('=== 批量删除确认 ===');
    
    // 获取当前活动页面
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) {
        console.error('未找到活动页面');
        showNotification('未找到活动页面', 'error');
        return;
    }
    
    console.log('当前活动页面ID:', activeSection.id);
    
    // 根据页面ID映射表格ID
    const tableIdMap = {
        'consultations': 'consultation-table-body',
        'wechat': 'wechat-table-body',
        'partnership': 'partnership-table-body',
        'other': 'other-table-body'
    };
    
    const tableId = tableIdMap[activeSection.id];
    if (!tableId) {
        console.error('未知的页面ID:', activeSection.id);
        showNotification('当前页面不支持批量删除', 'error');
        return;
    }
    
    console.log('表格ID:', tableId);
    
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('未找到表格元素:', tableId);
        showNotification('表格数据未加载，请刷新页面', 'error');
        return;
    }
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"]:checked');
    console.log('找到的复选框数量:', checkboxes.length);
    
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
                console.log('选中记录:', recordIdStr, getSubmissionField(record, 'name', record.type) || '未知用户');
            }
        }
    });
    
    if (idsToDelete.length === 0) {
        showNotification('未找到选中的有效记录', 'error');
        return;
    }
    
    // 设置删除队列
    deleteQueue = {
        type: activeSection.id,
        ids: idsToDelete,
        records: recordsToDelete,
        isBatch: true
    };
    
    console.log('批量删除队列:', deleteQueue);
    
    // 构建确认消息
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
    
    // 显示确认模态框
    document.getElementById('delete-confirm-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 8. 执行删除操作
// 8. 执行删除操作
function executeDelete() {
    if (deleteQueue.ids.length === 0) {
        showNotification('没有要删除的记录', 'error');
        return;
    }
    
    console.log(`开始删除 ${deleteQueue.ids.length} 条记录`, deleteQueue);
    
    // 备份被删除的记录（用于撤销）
    lastDeletedRecords = [...deleteQueue.records];
    
    // 【关键修复】从localStorage中删除 - 确保正确处理ID类型
    const allSubmissions = getAllSubmissions();
    const remainingSubmissions = allSubmissions.filter(sub => {
        // 将当前记录的ID转换为字符串，然后检查是否在删除队列中
        const subIdStr = sub.id ? sub.id.toString() : '';
        return !deleteQueue.ids.some(idToDelete => 
            idToDelete.toString() === subIdStr
        );
    });
    
    console.log(`过滤结果: ${allSubmissions.length} -> ${remainingSubmissions.length} 条记录`);
    
    // 验证删除数量
    const actuallyDeleted = allSubmissions.length - remainingSubmissions.length;
    if (actuallyDeleted !== deleteQueue.ids.length) {
        console.warn(`警告: 预期删除 ${deleteQueue.ids.length} 条，实际删除了 ${actuallyDeleted} 条`);
    }
    
    // 保存更新后的数据
    localStorage.setItem('cement_submissions', JSON.stringify(remainingSubmissions));
    
    // 关闭模态框
    closeDeleteModal();
    
    // 显示成功消息（带撤销选项）
    showUndoNotification(actuallyDeleted);
    
    // 刷新当前页面数据
    refreshCurrentPage();
    
    // 更新所有统计和计数
    updateCounts();
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadStats();
    }
    
    // 清空删除队列
    deleteQueue = { type: '', ids: [], records: [], isBatch: false };
    
    // 自动隐藏撤销通知（10秒后）
    setTimeout(() => {
        hideUndoNotification();
        lastDeletedRecords = []; // 清空备份
    }, UNDO_TIMEOUT);
}

// 9. 撤销删除操作
function undoLastDelete() {
    if (lastDeletedRecords.length === 0) {
        showNotification('没有可撤销的删除操作', 'info');
        return;
    }
    
    console.log('撤销上次删除操作', lastDeletedRecords);
    
    // 获取当前所有数据
    const currentSubmissions = getAllSubmissions();
    
    // 恢复被删除的记录
    const restoredSubmissions = [...currentSubmissions, ...lastDeletedRecords];
    
    // 按时间排序
    restoredSubmissions.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.id).getTime();
        const timeB = new Date(b.timestamp || b.id).getTime();
        return timeB - timeA;
    });
    
    // 保存恢复后的数据
    localStorage.setItem('cement_submissions', JSON.stringify(restoredSubmissions));
    
    // 隐藏撤销通知
    hideUndoNotification();
    
    // 显示成功消息
    showNotification(`已恢复 ${lastDeletedRecords.length} 条记录`, 'success');
    
    // 刷新页面
    refreshCurrentPage();
    updateCounts();
    
    // 清空备份
    lastDeletedRecords = [];
}

// 10. 辅助函数
function closeDeleteModal() {
    document.getElementById('delete-confirm-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    deleteQueue = { type: '', ids: [], records: [], isBatch: false };
}

// 清除所有选择
function clearSelection() {
    console.log('清除所有选择...');
    
    // 获取当前活动页面
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    // 根据活动页面找到对应的表格
    const tableIdMap = {
        'consultations': 'consultation-table-body',
        'wechat': 'wechat-table-body',
        'partnership': 'partnership-table-body',
        'other': 'other-table-body'
    };
    
    const tableId = tableIdMap[activeSection.id];
    if (!tableId) return;
    
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        
        // 清除行高亮
        const row = cb.closest('tr');
        if (row) {
            row.classList.remove('selected-row');
            row.dataset.selected = 'false';
        }
    });
    
    // 取消表头的全选复选框
    const headerCheckbox = table.querySelector('thead input[type="checkbox"]');
    if (headerCheckbox) {
        headerCheckbox.checked = false;
    }
    
    // 隐藏批量工具栏
    document.getElementById('batch-toolbar').style.display = 'none';
    
    console.log('已清除所有选择');
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

function findRecordIdFromRow(row) {
    // 尝试从行数据属性或按钮onclick参数中提取ID
    if (row.dataset.id) return row.dataset.id;
    
    const viewBtn = row.querySelector('button[onclick*="viewDetail"]');
    if (viewBtn) {
        const match = viewBtn.getAttribute('onclick').match(/viewDetail\((\d+)\)/);
        if (match) return match[1];
    }
    
    return null;
}

function exportCurrentData() {
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id) {
        exportByType(); // 调用已有的导出功能
    }
    closeDeleteModal();
}

// 11. 在表格渲染时添加复选框和ID属性
// 修改现有的数据加载函数（如 loadConsultations, loadWechatSubmissions 等）
// 在创建表格行时添加：
function enhanceTableRow(row, recordId) {
    row.dataset.id = recordId;
    
    // 添加复选框单元格
    const checkboxCell = document.createElement('td');
    checkboxCell.innerHTML = '<input type="checkbox" onclick="updateBatchToolbar()">';
    row.insertBefore(checkboxCell, row.firstChild);
    
    return row;
}

// 12. 在DOM加载完成后初始化删除功能
document.addEventListener('DOMContentLoaded', function() {
    // 在现有初始化代码后添加
    setTimeout(() => {
        initDeleteFunction();
    }, 1000);
});

function checkDataIdTypes() {
    const submissions = getAllSubmissions();
    const idTypes = new Map();
    
    submissions.forEach((sub, index) => {
        const id = sub.id;
        const type = typeof id;
        const value = id !== undefined ? id.toString() : 'undefined';
        
        if (!idTypes.has(value)) {
            idTypes.set(value, { type, count: 0, indices: [] });
        }
        const entry = idTypes.get(value);
        entry.count++;
        entry.indices.push(index);
    });
    
    // 检查重复ID
    const duplicates = Array.from(idTypes.entries())
        .filter(([value, info]) => info.count > 1);
    
    console.log('ID类型分析:');
    console.log(`总记录数: ${submissions.length}`);
    console.log(`唯一ID数: ${idTypes.size}`);
    console.log(`重复ID数: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
        console.warn('发现重复ID:');
        duplicates.forEach(([value, info]) => {
            console.warn(`ID: ${value}, 类型: ${info.type}, 重复次数: ${info.count}, 位置: ${info.indices}`);
        });
    }
    
    return duplicates;
}

// 增强的测试函数
function testDeleteFunctionEnhanced() {
    console.log('=== 增强版删除功能测试 ===');
    
    // 1. 获取当前数据状态
    const allDataBefore = getAllSubmissions();
    console.log('📊 测试前数据总量:', allDataBefore.length);
    
    // 2. 检查ID类型分布
    const idTypes = {};
    allDataBefore.forEach(item => {
        const type = typeof item.id;
        idTypes[type] = (idTypes[type] || 0) + 1;
    });
    console.log('🔍 ID类型分布:', idTypes);
    
    // 3. 查找第一条记录
    const firstRow = document.querySelector('#consultation-table-body tr:first-child');
    if (!firstRow) {
        console.error('❌ 没有找到表格行');
        return;
    }
    
    const recordId = firstRow.dataset.id;
    const recordName = firstRow.querySelector('td:nth-child(3)').textContent;
    
    console.log('🎯 目标记录信息:');
    console.log('   ID:', recordId, '类型:', typeof recordId);
    console.log('   姓名:', recordName);
    
    // 4. 在数据中查找该记录
    const targetRecord = allDataBefore.find(item => {
        const itemIdStr = item.id ? item.id.toString() : '';
        const targetIdStr = recordId ? recordId.toString() : '';
        return itemIdStr === targetIdStr;
    });
    
    if (!targetRecord) {
        console.error('❌ 未在数据中找到该记录');
        return;
    }
    
    console.log('✅ 找到记录:', targetRecord);
    
    // 5. 模拟删除
    deleteQueue = {
        type: targetRecord.type || 'consultation',
        ids: [recordId.toString()],
        records: [targetRecord],
        isBatch: false
    };
    
    console.log('🎯 设置的deleteQueue:', deleteQueue);
    
    // 6. 执行删除
    console.log('⏳ 开始执行删除...');
    executeDelete();
    
    // 7. 验证结果
    setTimeout(() => {
        console.log('🔎 验证删除结果...');
        const allDataAfter = getAllSubmissions();
        
        console.log('📊 数据变化:', allDataBefore.length, '->', allDataAfter.length);
        console.log('🎯 删除数量:', allDataBefore.length - allDataAfter.length);
        
        // 检查目标记录是否还存在
        const stillExists = allDataAfter.some(item => {
            const itemIdStr = item.id ? item.id.toString() : '';
            return itemIdStr === recordId.toString();
        });
        
        console.log('❌ 目标记录是否已删除?', stillExists ? '❌ 否 (错误)' : '✅ 是');
        
        if (stillExists) {
            console.error('❌ 删除失败：目标记录仍然存在');
        } else {
            console.log('🎉 删除成功！');
            
            // 检查是否有其他记录被误删
            const deletedRecords = allDataBefore.filter(beforeItem => {
                const beforeId = beforeItem.id ? beforeItem.id.toString() : '';
                return !allDataAfter.some(afterItem => {
                    const afterId = afterItem.id ? afterItem.id.toString() : '';
                    return afterId === beforeId;
                });
            });
            
            if (deletedRecords.length > 1) {
                console.warn('⚠️ 发现误删记录:', deletedRecords.length - 1, '条');
                deletedRecords.forEach((record, index) => {
                    console.log(`   误删记录 ${index + 1}: ID=${record.id}, 姓名=${record.name}`);
                });
            }
        }
        
        // 恢复数据（可选）
        console.log('🔄 是否恢复测试数据? (手动恢复: localStorage.setItem(\'cement_submissions\', JSON.stringify(originalData)))');
        
    }, 2000);
}

// 批量删除测试函数
function testBatchDeleteFunction() {
    console.log('=== 批量删除功能测试 ===');
    
    // 获取前3行的复选框
    const checkboxes = document.querySelectorAll('#consultation-table-body tr input[type="checkbox"]');
    if (checkboxes.length < 3) {
        console.error('❌ 数据不足，需要至少3条记录');
        return;
    }
    
    // 选择前3条
    checkboxes[0].checked = true;
    checkboxes[1].checked = true;
    checkboxes[2].checked = true;
    
    updateBatchToolbar();
    
    // 执行批量删除确认
    console.log('🎯 选择了3条记录进行批量删除测试');
    batchDeleteConfirm();
    
    // 注意：需要手动确认删除
    console.log('⚠️ 需要手动在模态框中点击"确认删除"按钮');
}

// 数据完整性检查
function checkDataIntegrity() {
    console.log('=== 数据完整性检查 ===');
    
    const submissions = getAllSubmissions();
    const idMap = new Map();
    const duplicates = [];
    
    // 检查重复ID
    submissions.forEach((item, index) => {
        if (!item.id) {
            console.warn(`⚠️ 记录 ${index} 没有ID字段`);
            return;
        }
        
        const idStr = item.id.toString();
        if (idMap.has(idStr)) {
            duplicates.push({
                id: idStr,
                positions: [idMap.get(idStr), index],
                records: [submissions[idMap.get(idStr)], item]
            });
        } else {
            idMap.set(idStr, index);
        }
    });
    
    console.log(`📊 总记录数: ${submissions.length}`);
    console.log(`🔍 唯一ID数: ${idMap.size}`);
    console.log(`⚠️ 重复ID数: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
        console.error('❌ 发现重复ID:');
        duplicates.forEach(dup => {
            console.error(`   ID: ${dup.id}, 位置: ${dup.positions}`);
            console.error(`   记录1:`, dup.records[0]);
            console.error(`   记录2:`, dup.records[1]);
        });
        
        // 提供修复选项
        if (confirm(`发现 ${duplicates.length} 个重复ID。是否自动修复？（保留第一条，删除重复项）`)) {
            fixDuplicateIds();
        }
    } else {
        console.log('✅ 数据完整性检查通过');
    }
    
    return duplicates;
}

// 修复重复ID
function fixDuplicateIds() {
    const submissions = getAllSubmissions();
    const uniqueMap = new Map();
    const fixedSubmissions = [];
    
    submissions.forEach(item => {
        if (!item.id) {
            // 为没有ID的记录生成新ID
            item.id = Date.now() + Math.random();
            fixedSubmissions.push(item);
            return;
        }
        
        const idStr = item.id.toString();
        if (!uniqueMap.has(idStr)) {
            uniqueMap.set(idStr, true);
            fixedSubmissions.push(item);
        } else {
            console.log(`删除重复记录: ID=${idStr}, 时间=${item.timestamp}`);
        }
    });
    
    localStorage.setItem('cement_submissions', JSON.stringify(fixedSubmissions));
    console.log(`✅ 重复ID修复完成: ${submissions.length} -> ${fixedSubmissions.length} 条记录`);
    
    // 刷新页面
    setTimeout(() => location.reload(), 1000);
}

// 增强的批量删除测试函数
function testBatchDeleteFunction() {
    console.log('=== 批量删除功能测试 ===');
    
    // 1. 切换到预约咨询页面
    switchSection('consultations');
    
    // 2. 等待表格加载完成
    setTimeout(() => {
        console.log('等待表格加载...');
        
        const tableId = 'consultation-table-body';
        const table = document.getElementById(tableId);
        
        if (!table) {
            console.error('❌ 未找到表格元素:', tableId);
            console.log('尝试刷新页面...');
            loadConsultations();
            setTimeout(testBatchDeleteFunction, 500);
            return;
        }
        
        // 3. 获取前3行的复选框
        const checkboxes = table.querySelectorAll('tr input[type="checkbox"]');
        console.log('找到的复选框总数:', checkboxes.length);
        
        if (checkboxes.length < 3) {
            console.error('❌ 数据不足，需要至少3条记录，当前只有', checkboxes.length);
            
            // 如果没有足够数据，添加测试数据
            if (confirm('数据不足，是否添加测试数据？')) {
                createComprehensiveTestData();
                setTimeout(testBatchDeleteFunction, 1000);
            }
            return;
        }
        
        // 4. 选择前3条记录
        checkboxes[0].checked = true;
        checkboxes[1].checked = true;
        checkboxes[2].checked = true;
        
        console.log('✅ 已选择3条记录');
        
        // 5. 更新批量工具栏
        updateBatchToolbar();
        
        // 6. 获取数据用于验证
        const allDataBefore = getAllSubmissions();
        console.log('📊 测试前数据总量:', allDataBefore.length);
        
        // 7. 获取选中记录的信息
        const selectedRecords = [];
        checkboxes[0].closest('tr').querySelectorAll('td:nth-child(3)').forEach((td, index) => {
            if (index < 3) {
                selectedRecords.push(td.textContent);
            }
        });
        
        console.log('🎯 选中的记录:', selectedRecords);
        
        // 8. 执行批量删除确认
        console.log('🚀 开始批量删除确认...');
        batchDeleteConfirm();
        
        // 9. 创建验证函数（在删除后执行）
        window.verifyBatchDelete = function() {
            console.log('🔎 验证批量删除结果...');
            
            const allDataAfter = getAllSubmissions();
            console.log('📊 数据变化:', allDataBefore.length, '->', allDataAfter.length);
            console.log('🎯 删除数量:', allDataBefore.length - allDataAfter.length);
            
            // 检查删除是否正确
            if (allDataBefore.length - allDataAfter.length === 3) {
                console.log('✅ 批量删除成功！');
            } else {
                console.warn('⚠️ 删除数量不一致');
            }
            
            // 提示用户
            alert(`批量删除完成！\n原始数据: ${allDataBefore.length} 条\n当前数据: ${allDataAfter.length} 条\n删除: ${allDataBefore.length - allDataAfter.length} 条`);
        };
        
        console.log('⚠️ 请在模态框中点击"确认删除"按钮，然后运行 verifyBatchDelete() 验证结果');
        
    }, 1000);
}

// 检查批量操作状态
function checkBatchOperationStatus() {
    console.log('=== 批量操作状态检查 ===');
    
    // 1. 检查当前活动页面
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        console.log('当前活动页面:', activeSection.id);
    } else {
        console.error('没有活动页面');
    }
    
    // 2. 检查表格元素
    const tableIds = ['consultation-table-body', 'wechat-table-body', 'partnership-table-body', 'other-table-body'];
    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table) {
            const rows = table.querySelectorAll('tr');
            console.log(`表格 ${tableId}: ${rows.length} 行`);
            
            if (rows.length > 0) {
                const checkboxes = table.querySelectorAll('input[type="checkbox"]');
                console.log(`  复选框: ${checkboxes.length} 个`);
                
                const checkedBoxes = table.querySelectorAll('input[type="checkbox"]:checked');
                console.log(`  已选中: ${checkedBoxes.length} 个`);
            }
        } else {
            console.log(`表格 ${tableId}: 未找到`);
        }
    });
    
    // 3. 检查批量工具栏
    const toolbar = document.getElementById('batch-toolbar');
    console.log('批量工具栏状态:', toolbar.style.display);
    
    // 4. 返回可用的表格
    const availableTables = tableIds.filter(id => document.getElementById(id));
    console.log('可用表格:', availableTables);
    
    return availableTables;
}

// 自动批量删除测试（包含自动确认）
function testAutoBatchDelete() {
    console.log('=== 自动批量删除测试 ===');
    
    // 保存原始数据以便恢复
    const originalData = getAllSubmissions();
    console.log('原始数据量:', originalData.length);
    
    // 切换到预约咨询页面
    switchSection('consultations');
    
    setTimeout(() => {
        const tableId = 'consultation-table-body';
        const table = document.getElementById(tableId);
        
        if (!table) {
            console.error('表格未加载');
            loadConsultations();
            setTimeout(testAutoBatchDelete, 500);
            return;
        }
        
        const checkboxes = table.querySelectorAll('tr input[type="checkbox"]');
        if (checkboxes.length < 3) {
            console.error('数据不足');
            return;
        }
        
        // 选择前3条
        checkboxes[0].checked = true;
        checkboxes[1].checked = true;
        checkboxes[2].checked = true;
        updateBatchToolbar();
        
        // 获取选中记录的ID
        const selectedIds = [];
        checkboxes[0].closest('tr').dataset.id && selectedIds.push(checkboxes[0].closest('tr').dataset.id);
        checkboxes[1].closest('tr').dataset.id && selectedIds.push(checkboxes[1].closest('tr').dataset.id);
        checkboxes[2].closest('tr').dataset.id && selectedIds.push(checkboxes[2].closest('tr').dataset.id);
        
        console.log('选中的ID:', selectedIds);
        
        // 获取完整的记录数据
        const submissions = getAllSubmissions();
        const selectedRecords = selectedIds.map(id => {
            const idStr = id.toString();
            return submissions.find(s => s.id && s.id.toString() === idStr);
        }).filter(Boolean);
        
        // 设置删除队列
        deleteQueue = {
            type: 'consultations',
            ids: selectedIds.map(id => id.toString()),
            records: selectedRecords,
            isBatch: true
        };
        
        console.log('删除队列已设置，开始执行删除...');
        
        // 直接执行删除（跳过确认模态框）
        executeDelete();
        
        // 验证结果
        setTimeout(() => {
            const newData = getAllSubmissions();
            console.log('删除后数据量:', newData.length);
            console.log('删除记录数:', originalData.length - newData.length);
            
            if (originalData.length - newData.length === 3) {
                console.log('✅ 批量删除测试通过！');
                
                // 询问是否恢复数据
                if (confirm('批量删除测试完成，是否恢复数据？')) {
                    localStorage.setItem('cement_submissions', JSON.stringify(originalData));
                    console.log('数据已恢复');
                    refreshCurrentPage();
                }
            } else {
                console.error('❌ 批量删除测试失败');
                console.log('原始数据:', originalData.length);
                console.log('新数据:', newData.length);
                
                // 恢复数据
                localStorage.setItem('cement_submissions', JSON.stringify(originalData));
                console.log('数据已恢复');
                refreshCurrentPage();
            }
        }, 1000);
        
    }, 1000);
}

// 重新加载当前页面的表格数据
function reloadCurrentTable() {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    switch(activeSection.id) {
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
    }
    console.log('已重新加载:', activeSection.id);
}

// 13. 全局函数导出
window.confirmDelete = confirmDelete;
window.toggleSelectAll = toggleSelectAll;
window.updateBatchToolbar = updateBatchToolbar;
window.batchDeleteConfirm = batchDeleteConfirm;
window.clearSelection = clearSelection;
window.closeDeleteModal = closeDeleteModal;
window.executeDelete = executeDelete;
window.undoLastDelete = undoLastDelete;
window.hideUndoNotification = hideUndoNotification;

// 确保函数全局可用
window.loadStats = loadStats;
window.drawSubmissionChart = drawSubmissionChart;
window.drawTypeChart = drawTypeChart;

// 确保函数全局可用
window.createComprehensiveTestData = createComprehensiveTestData;

// 使函数在全局可用
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.checkPasswordStrength = checkPasswordStrength;
window.checkPasswordMatch = checkPasswordMatch;

// 确保函数全局可用
window.fixDataTypes = fixDataTypes;

// 在 admin.js 末尾添加
window.viewWechatDetail = viewWechatDetail;
window.editWechatSubmission = editWechatSubmission;
window.viewPartnershipDetail = viewPartnershipDetail;
window.editPartnershipSubmission = editPartnershipSubmission;
window.viewOtherDetail = viewOtherDetail;
window.editOtherSubmission = editOtherSubmission;
window.filterWechatSubmissions = filterWechatSubmissions;
window.searchWechatSubmissions = searchWechatSubmissions;
window.prevWechatPage = prevWechatPage;
window.nextWechatPage = nextWechatPage;
window.filterPartnershipSubmissions = filterPartnershipSubmissions;
window.searchPartnershipSubmissions = searchPartnershipSubmissions;
window.prevPartnershipPage = prevPartnershipPage;
window.nextPartnershipPage = nextPartnershipPage;
window.filterOtherSubmissions = filterOtherSubmissions;
window.searchOtherSubmissions = searchOtherSubmissions;
window.prevOtherPage = prevOtherPage;
window.nextOtherPage = nextOtherPage;