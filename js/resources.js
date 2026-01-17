// 资源中心页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 资源分类标签切换
    const resourceTabs = document.querySelectorAll('.resource-tab');
    const resourcePanels = document.querySelectorAll('.resource-panel');
    
    function showResourcePanel(resourceId) {
        // 隐藏所有面板
        resourcePanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // 显示指定的面板
        const activePanel = document.getElementById(resourceId + '-panel');
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        // 更新按钮状态
        resourceTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.resource === resourceId) {
                tab.classList.add('active');
            }
        });
        
        // 更新URL锚点
        history.replaceState(null, null, `#${resourceId}`);
    }
    
    // 为每个标签按钮添加点击事件
    resourceTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const resourceId = this.dataset.resource;
            showResourcePanel(resourceId);
        });
    });
    
    // 锚点导航处理
    function handleAnchorNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash && ['tools', 'research', 'policy', 'videos'].includes(hash)) {
            showResourcePanel(hash);
        }
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', handleAnchorNavigation);
    
    // 初始处理
    handleAnchorNavigation();
    
    // 下载按钮点击事件
    const downloadButtons = document.querySelectorAll('.download-btn, .watch-btn');
    const modal = document.getElementById('download-modal');
    const modalClose = document.querySelector('.modal-close');
    const closeModalBtn = document.getElementById('close-modal');
    
    // 资源数据
    const resourceData = {
        'digital-maturity-tool': {
            title: '水泥安全数字化成熟度自评工具',
            description: '请填写信息获取《水泥安全数字化成熟度自评工具》Excel模板',
            level: 'free'
        },
        'roi-calculator': {
            title: '智能巡检系统ROI测算模型',
            description: '请填写信息获取《智能巡检系统ROI测算模型》工具',
            level: 'basic'
        },
        'confined-space-checklist': {
            title: '有限空间作业数字化检查清单',
            description: '请填写信息获取《有限空间作业数字化检查清单》PDF文档',
            level: 'free'
        },
        'digital-transformation-toolkit': {
            title: '数字化转型规划工具箱',
            description: '请填写信息获取《数字化转型规划工具箱》综合工具包',
            level: 'premium'
        },
        'requirements-template': {
            title: '智能巡检系统需求规格书模板',
            description: '请填写信息获取《智能巡检系统需求规格书模板》Word文档',
            level: 'free'
        },
        'contractor-assessment': {
            title: '承包商安全绩效评估工具',
            description: '请填写信息获取《承包商安全绩效评估工具》Excel工具',
            level: 'basic'
        },
        '2024-digital-report': {
            title: '《2024水泥行业安全生产数字化发展报告》',
            description: '请填写信息获取《2024水泥行业安全生产数字化发展报告》完整版',
            level: 'premium'
        },
        'inspection-guide': {
            title: '《水泥行业智能巡检最佳实践指南》',
            description: '请填写信息获取《水泥行业智能巡检最佳实践指南》完整版',
            level: 'basic'
        },
        'maturity-model-summary': {
            title: '《水泥安全数字化成熟度模型V2.0》摘要版',
            description: '请填写信息获取《水泥安全数字化成熟度模型V2.0》摘要版',
            level: 'free'
        },
        'law-compilation': {
            title: '水泥行业安全生产主要法律法规汇编（2024版）',
            description: '请填写信息获取《水泥行业安全生产主要法律法规汇编（2024版）》',
            level: 'free'
        },
        'confined-space-guide': {
            title: '《工贸企业有限空间作业安全规定》解读与应用指南',
            description: '请填写信息获取《工贸企业有限空间作业安全规定》解读与应用指南',
            level: 'basic'
        },
        'standards-compilation': {
            title: '水泥行业安全生产数字化相关标准汇编',
            description: '请填写信息获取《水泥行业安全生产数字化相关标准汇编》',
            level: 'free'
        },
        'confined-space-case': {
            title: '有限空间作业数字化监护系统应用案例分享',
            description: '请填写信息观看《有限空间作业数字化监护系统应用案例分享》视频',
            level: 'basic'
        },
        'inspection-training': {
            title: '智能巡检系统实施与推广培训课程',
            description: '请填写信息观看《智能巡检系统实施与推广培训课程》视频',
            level: 'premium'
        }
    };
    
    // 打开下载模态框
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const resourceId = this.dataset.resource || this.dataset.video;
            
            if (resourceData[resourceId]) {
                const resource = resourceData[resourceId];
                
                // 更新模态框标题和描述
                document.getElementById('resource-title').textContent = resource.title;
                document.getElementById('resource-description').textContent = resource.description;
                
                // 重置表单
                resetForm();
                
                // 根据资源级别调整表单步骤
                adjustFormSteps(resource.level);
                
                // 显示模态框
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                // 存储当前资源ID
                modal.dataset.currentResource = resourceId;
                modal.dataset.resourceLevel = resource.level;
            }
        });
    });
    
    // 关闭模态框
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            closeModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeModal();
        });
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // 重置表单
    function resetForm() {
        const form = document.getElementById('download-form');
        const successMessage = document.getElementById('success-message');
        
        // 重置表单状态
        form.reset();
        form.style.display = 'block';
        successMessage.style.display = 'none';
        
        // 重置步骤
        const steps = document.querySelectorAll('.form-step');
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        // 显示第一步
        document.getElementById('step-email').classList.add('active');
    }
    
    // 根据资源级别调整表单步骤
    function adjustFormSteps(level) {
        const form = document.getElementById('download-form');
        
        if (level === 'free') {
            // 免费资源只需要邮箱
            form.querySelector('.next-step[data-next="step-info"]').style.display = 'none';
            form.querySelector('.prev-step').style.display = 'none';
            
            // 修改提交按钮文本
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '获取资源';
            }
        } else {
            // 显示所有步骤
            form.querySelector('.next-step[data-next="step-info"]').style.display = 'inline-block';
            form.querySelector('.prev-step').style.display = 'inline-block';
            
            // 修改提交按钮文本
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '提交并获取资源';
            }
        }
    }
    
    // 表单步骤切换
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    
    nextStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStepId = this.dataset.next;
            const currentStep = this.closest('.form-step');
            
            // 验证当前步骤
            if (validateStep(currentStep.id)) {
                // 切换步骤
                currentStep.classList.remove('active');
                document.getElementById(nextStepId).classList.add('active');
            }
        });
    });
    
    prevStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const steps = Array.from(document.querySelectorAll('.form-step'));
            const currentIndex = steps.findIndex(step => step === currentStep);
            
            if (currentIndex > 0) {
                currentStep.classList.remove('active');
                steps[currentIndex - 1].classList.add('active');
            }
        });
    });
    
    // 步骤验证
    function validateStep(stepId) {
        const step = document.getElementById(stepId);
        const inputs = step.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'red';
                
                // 添加错误提示
                let errorMsg = input.parentNode.querySelector('.error-message');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = 'red';
                    errorMsg.style.fontSize = '0.8rem';
                    errorMsg.style.marginTop = '5px';
                    input.parentNode.appendChild(errorMsg);
                }
                errorMsg.textContent = '此字段为必填项';
            } else {
                input.style.borderColor = '';
                const errorMsg = input.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = '';
                
                // 邮箱格式验证
                if (input.type === 'email' && !isValidEmail(input.value)) {
                    isValid = false;
                    input.style.borderColor = 'red';
                    
                    let errorMsg = input.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = 'red';
                        errorMsg.style.fontSize = '0.8rem';
                        errorMsg.style.marginTop = '5px';
                        input.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = '请输入有效的邮箱地址';
                }
            }
        });
        
        return isValid;
    }
    
    // 邮箱格式验证
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 表单提交
    const downloadForm = document.getElementById('download-form');
    
    if (downloadForm) {
        downloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 验证最后一步
            const currentStep = this.querySelector('.form-step.active');
            if (!validateStep(currentStep.id)) {
                return;
            }
            
            // 获取表单数据
            const formData = {
                email: document.getElementById('user-email').value,
                name: document.getElementById('user-name')?.value || '',
                company: document.getElementById('user-company')?.value || '',
                position: document.getElementById('user-position')?.value || '',
                needs: document.getElementById('user-needs')?.value || '',
                subscribe: document.getElementById('subscribe-newsletter')?.checked || false,
                resource: modal.dataset.currentResource,
                resourceLevel: modal.dataset.resourceLevel,
                timestamp: new Date().toISOString()
            };
            
            // 模拟提交成功
            showSuccessMessage(formData);
        });
    }
    
    // 显示成功消息
    function showSuccessMessage(formData) {
        const form = document.getElementById('download-form');
        const successMessage = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        
        // 根据资源级别显示不同的成功消息
        let message = '';
        if (formData.resourceLevel === 'free') {
            message = '资源下载链接已发送到您的邮箱，请注意查收。';
        } else if (formData.resourceLevel === 'basic') {
            message = '资源下载链接已发送到您的邮箱，请注意查收。';
        } else {
            message = '您的申请已提交，我们将在24小时内审核并通过邮件发送资源下载链接。';
        }
        
        successText.textContent = message;
        
        // 隐藏表单，显示成功消息
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // 在实际应用中，这里应该发送数据到服务器
        console.log('表单提交数据:', formData);
        
        // 模拟API调用
        simulateApiCall(formData);
    }
    
    // 模拟API调用
    function simulateApiCall(formData) {
        // 这里可以添加实际的API调用
        // 目前只是模拟
        setTimeout(() => {
            console.log('API调用成功，数据已保存');
        }, 1000);
    }
    
    // URL参数处理
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const roleParam = urlParams.get('role');
    
    // 处理分类参数
    if (categoryParam && ['tools', 'research', 'policy', 'videos'].includes(categoryParam)) {
        showResourcePanel(categoryParam);
    }
    
    // 处理角色参数（高亮相关资源）
    if (roleParam && ['safety', 'production', 'decision'].includes(roleParam)) {
        // 这里可以添加角色相关的资源高亮逻辑
        // 目前只是添加一个提示
        const roleNames = {
            'safety': '安全管理者',
            'production': '生产管理者',
            'decision': '决策者'
        };
        
        const roleName = roleNames[roleParam] || roleParam;
        
        const roleElement = document.createElement('div');
        roleElement.className = 'role-filter-notice';
        roleElement.innerHTML = `
            <div style="background: #f0f7ff; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid var(--primary-color);">
                <h3>为您推荐：${roleName}</h3>
                <p>已为您筛选适合${roleName}的资源 <a href="resources.html" style="color: var(--secondary-color);">查看所有资源</a></p>
            </div>
        `;
        
        const panelHeader = document.querySelector('.panel-header');
        if (panelHeader) {
            panelHeader.parentNode.insertBefore(roleElement, panelHeader.nextSibling);
        }
    }
    
    // 资源卡片动画
    const resourceCards = document.querySelectorAll('.resource-card, .video-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 延迟显示，创建交错效果
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 初始设置和观察
    resourceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // 资源级别徽章动画
    const resourceBadges = document.querySelectorAll('.resource-badge, .video-badge');
    
    resourceBadges.forEach((badge, index) => {
        badge.style.transform = 'scale(0)';
        badge.style.transition = 'transform 0.5s ease';
        
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, index * 200);
    });
});