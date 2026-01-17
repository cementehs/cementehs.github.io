// 联系我们页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 联系选项切换
    const optionButtons = document.querySelectorAll('.option-card .btn');
    const contactForms = document.querySelectorAll('.contact-form');
    const optionCards = document.querySelectorAll('.option-card');
    
    // 显示指定的联系表单
    function showContactForm(optionId) {
        // 隐藏所有表单
        contactForms.forEach(form => {
            form.classList.remove('active');
        });
        
        // 显示指定的表单
        const activeForm = document.getElementById(optionId + '-form');
        if (activeForm) {
            activeForm.classList.add('active');
            
            // 滚动到表单区域
            setTimeout(() => {
                activeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
        
        // 高亮对应的选项卡片
        optionCards.forEach(card => {
            card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            card.style.borderColor = '#f0f0f0';
        });
        
        const activeCard = document.getElementById(optionId + '-option');
        if (activeCard) {
            activeCard.style.boxShadow = '0 5px 15px rgba(42, 91, 158, 0.2)';
            activeCard.style.borderColor = 'var(--primary-color)';
        }
    }
    
    // 为选项按钮添加点击事件
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const option = this.dataset.option;
            showContactForm(option);
        });
    });
    
    // CTA按钮点击事件
    const ctaButtons = document.querySelectorAll('.contact-cta .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.dataset.option) {
                const option = this.dataset.option;
                showContactForm(option);
            }
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
    
    // 表单提交处理
    const forms = document.querySelectorAll('#consultation-form-content, #wechat-form-content, #partnership-form-content, #other-form-content');
    const successModal = document.getElementById('success-modal');
    const modalClose = document.querySelectorAll('.modal-close');
    const closeSuccessModal = document.getElementById('close-success-modal');
    
    // 成功消息配置
    const successMessages = {
        'consultation': {
            title: '预约提交成功！',
            message: '我们将在24小时内与您确认咨询时间，请保持电话和邮箱畅通。'
        },
        'wechat': {
            title: '提交成功！',
            message: '微信二维码和详细资料已发送到您的邮箱，请注意查收。'
        },
        'partnership': {
            title: '合作申请提交成功！',
            message: '我们将在3个工作日内与您联系，请保持电话和邮箱畅通。'
        },
        'other': {
            title: '咨询提交成功！',
            message: '我们将在24小时内回复您的咨询，请保持邮箱畅通。'
        }
    };
    
    // 表单验证函数
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
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
                
                // 邮箱格式验证
                if (field.type === 'email' && !isValidEmail(field.value)) {
                    isValid = false;
                    field.style.borderColor = 'red';
                    
                    let errorMsg = field.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = 'red';
                        errorMsg.style.fontSize = '0.8rem';
                        errorMsg.style.marginTop = '5px';
                        field.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = '请输入有效的邮箱地址';
                }
                
                // 网址格式验证
                if (field.type === 'url' && field.value && !isValidUrl(field.value)) {
                    isValid = false;
                    field.style.borderColor = 'red';
                    
                    let errorMsg = field.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = 'red';
                        errorMsg.style.fontSize = '0.8rem';
                        errorMsg.style.marginTop = '5px';
                        field.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = '请输入有效的网址';
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
    
    // 网址格式验证
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // 为每个表单添加提交事件
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                // 获取表单类型
                let formType = '';
                if (this.id.includes('consultation')) {
                    formType = 'consultation';
                } else if (this.id.includes('wechat')) {
                    formType = 'wechat';
                } else if (this.id.includes('partnership')) {
                    formType = 'partnership';
                } else if (this.id.includes('other')) {
                    formType = 'other';
                }
                
                // 获取表单数据
                const formData = getFormData(this, formType);
                
                // 显示成功消息
                showSuccessMessage(formType);
                
                // 重置表单
                this.reset();
                
                // 在实际应用中，这里应该发送数据到服务器
                console.log('表单提交数据:', formData);
                
                // 模拟API调用
                simulateApiCall(formData);
            }
        });
    });
    
    // 获取表单数据
    function getFormData(form, formType) {
        const formData = {
            type: formType,
            timestamp: new Date().toISOString()
        };
        
        // 收集所有表单字段
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                const value = input.type === 'checkbox' ? input.checked : input.value;
                formData[key] = value;
            }
        });
        
        return formData;
    }
    
    // 显示成功消息
    function showSuccessMessage(formType) {
        const successTitle = document.getElementById('success-title');
        const successMessage = document.getElementById('success-message');
        
        if (successMessages[formType]) {
            successTitle.textContent = successMessages[formType].title;
            successMessage.textContent = successMessages[formType].message;
        } else {
            successTitle.textContent = '提交成功！';
            successMessage.textContent = '我们将在24小时内与您联系，请保持电话和邮箱畅通。';
        }
        
        successModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭模态框
    if (modalClose) {
        modalClose.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        });
    }
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', function() {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // 点击模态框外部关闭
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // 模拟API调用
    function simulateApiCall(formData) {
        // 这里可以添加实际的API调用
        // 目前只是模拟
        setTimeout(() => {
            console.log('API调用成功，数据已保存:', formData);
        }, 1000);
    }
    
    // URL参数处理
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    
    // 处理类型参数
    if (typeParam && ['consultation', 'wechat', 'partnership', 'other'].includes(typeParam)) {
        showContactForm(typeParam);
    }
    
    // 服务参数处理（用于从其他页面跳转）
    const serviceParam = urlParams.get('service');
    if (serviceParam && ['diagnosis', 'selection', 'implementation', 'advisory', 'all'].includes(serviceParam)) {
        // 显示预约咨询表单
        showContactForm('consultation');
        
        // 设置服务选择
        setTimeout(() => {
            const serviceSelect = document.getElementById('consult-service');
            if (serviceSelect) {
                serviceSelect.value = serviceParam;
            }
        }, 500);
    }
    
    // 动画效果
    const optionCardsAnimated = document.querySelectorAll('.option-card');
    
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
    optionCardsAnimated.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});