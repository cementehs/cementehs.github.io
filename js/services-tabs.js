// 核心服务页面标签切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 服务标签切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    const servicePanels = document.querySelectorAll('.service-panel');
    
    function showServicePanel(serviceId) {
        // 隐藏所有面板
        servicePanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // 显示指定的面板
        const activePanel = document.getElementById(serviceId + '-panel');
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        // 更新按钮状态
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.service === serviceId) {
                btn.classList.add('active');
            }
        });
    }
    
    // 为每个标签按钮添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.dataset.service;
            showServicePanel(serviceId);
        });
    });
    
    // FAQ切换
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            const toggle = this.querySelector('.faq-toggle');
            
            // 关闭其他打开的FAQ
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    const otherItem = otherQuestion.parentElement;
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherToggle = otherQuestion.querySelector('.faq-toggle');
                    
                    otherItem.classList.remove('active');
                    otherAnswer.classList.remove('active');
                    otherToggle.textContent = '+';
                }
            });
            
            // 切换当前FAQ
            faqItem.classList.toggle('active');
            answer.classList.toggle('active');
            
            if (answer.classList.contains('active')) {
                toggle.textContent = '×';
            } else {
                toggle.textContent = '+';
            }
        });
    });
    
    // URL参数处理
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    
    if (serviceParam && ['diagnosis', 'selection', 'implementation', 'advisory'].includes(serviceParam)) {
        // 延迟执行，确保DOM完全加载
        setTimeout(() => {
            showServicePanel(serviceParam);
            
            // 滚动到服务区域
            const servicesSection = document.querySelector('.core-services');
            if (servicesSection) {
                window.scrollTo({
                    top: servicesSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
    
    // 价格动画效果
    const priceTags = document.querySelectorAll('.price-tag');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const priceObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    priceTags.forEach(tag => {
        priceObserver.observe(tag);
    });
});