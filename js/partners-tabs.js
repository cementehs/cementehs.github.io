// 合作伙伴页面标签切换功能
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // 显示指定的标签页
    function showTab(tabId) {
        // 隐藏所有标签页
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });
        
        // 显示指定的标签页
        const activePane = document.getElementById(tabId + '-tab');
        if (activePane) {
            activePane.classList.add('active');
        }
        
        // 更新按钮状态
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
    }
    
    // 为每个标签按钮添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            showTab(tabId);
        });
    });
    
    // 如果有URL参数，显示对应的标签页
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['tech', 'device', 'service', 'industry'].includes(tabParam)) {
        showTab(tabParam);
    }
});