// 解决方案页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 解决方案标签切换
    const solutionTabs = document.querySelectorAll('.solution-tab');
    const solutionPanels = document.querySelectorAll('.solution-panel');
    
    function showSolutionPanel(solutionId) {
        // 隐藏所有面板
        solutionPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // 显示指定的面板
        const activePanel = document.getElementById(solutionId + '-panel');
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        // 更新按钮状态
        solutionTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.solution === solutionId) {
                tab.classList.add('active');
            }
        });
        
        // 更新URL锚点
        history.replaceState(null, null, `#${solutionId}`);
    }
    
    // 为每个标签按钮添加点击事件
    solutionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const solutionId = this.dataset.solution;
            showSolutionPanel(solutionId);
        });
    });
    
    // ROI计算器功能
    const companySizeSelect = document.getElementById('company-size');
    const annualHazardsInput = document.getElementById('annual-hazards');
    const efficiencyGainEl = document.getElementById('efficiency-gain');
    const costSavingEl = document.getElementById('cost-saving');
    const roiPeriodEl = document.getElementById('roi-period');
    
    function calculateROI() {
        const companySize = companySizeSelect.value;
        const annualHazards = parseInt(annualHazardsInput.value) || 500;
        
        // 根据企业规模调整基础值
        let baseEfficiency = 30; // 基础效率提升百分比
        let baseCostSaving = 150000; // 基础年节约成本
        let baseROI = 14; // 基础投资回收期（月）
        
        if (companySize === 'small') {
            baseEfficiency = 25;
            baseCostSaving = 80000;
            baseROI = 16;
        } else if (companySize === 'large') {
            baseEfficiency = 35;
            baseCostSaving = 250000;
            baseROI = 12;
        }
        
        // 根据隐患数量调整（隐患越多，效益越大）
        const hazardFactor = Math.min(annualHazards / 500, 2); // 最大2倍
        
        // 计算最终值
        const efficiency = Math.round(baseEfficiency * (1 + (hazardFactor - 1) * 0.3));
        const costSaving = Math.round(baseCostSaving * hazardFactor);
        const roiPeriod = Math.round(baseROI / Math.sqrt(hazardFactor));
        
        // 更新显示
        efficiencyGainEl.textContent = `${efficiency}%`;
        costSavingEl.textContent = `¥${costSaving.toLocaleString()}`;
        roiPeriodEl.textContent = `${roiPeriod}`;
    }
    
    // 绑定计算器事件
    if (companySizeSelect && annualHazardsInput) {
        companySizeSelect.addEventListener('change', calculateROI);
        annualHazardsInput.addEventListener('input', calculateROI);
        
        // 初始计算
        calculateROI();
    }
    
    // CTA表单提交
    const ctaForm = document.getElementById('solutions-cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 简单的表单验证
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                    
                    // 添加错误提示
                    let errorMsg = field.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = 'red';
                        errorMsg.style.fontSize = '0.8rem';
                        errorMsg.style.marginTop = '5px';
                        field.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = '此字段为必填项';
                } else {
                    field.style.borderColor = '';
                    const errorMsg = field.parentNode.querySelector('.error-message');
                    if (errorMsg) errorMsg.textContent = '';
                }
            });
            
            if (isValid) {
                // 模拟提交成功
                alert('感谢您的预约！我们的专家将在24小时内与您联系。');
                this.reset();
            }
        });
    }
    
    // 锚点导航处理
    function handleAnchorNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash && ['inspection', 'high-risk', 'contractor', 'predictive'].includes(hash)) {
            showSolutionPanel(hash);
        }
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', handleAnchorNavigation);
    
    // 初始处理
    handleAnchorNavigation();
    
    // 滚动时高亮当前解决方案
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
    };
    
    const solutionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const solutionId = entry.target.id.replace('-panel', '');
                
                // 更新标签状态
                solutionTabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.solution === solutionId) {
                        tab.classList.add('active');
                    }
                });
                
                // 更新URL（不触发页面跳转）
                history.replaceState(null, null, `#${solutionId}`);
            }
        });
    }, observerOptions);
    
    // 观察所有解决方案面板
    solutionPanels.forEach(panel => {
        solutionObserver.observe(panel);
    });
    
    // 解决方案卡片动画
    const solutionCards = document.querySelectorAll('.pain-card, .path-step, .tip-card, .resource-card');
    
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // 初始设置
    solutionCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        cardObserver.observe(card);
    });
});