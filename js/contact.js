// 联系我们页面功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== contact.js 加载 ===');
    
    // 初始化变量
    let optionButtons, contactForms, optionCards;
    
    // 等待DOM完全加载后初始化
    setTimeout(initializeContactPage, 100);
    
    function initializeContactPage() {
        console.log('=== 初始化联系页面 ===');
        
        // 获取DOM元素
        optionButtons = document.querySelectorAll('.option-card .btn');
        contactForms = document.querySelectorAll('.contact-form');
        optionCards = document.querySelectorAll('.option-card');
        
        console.log('找到的选项按钮:', optionButtons.length);
        console.log('找到的联系表单:', contactForms.length);
        console.log('找到的选项卡片:', optionCards.length);
        
        // 初始化显示第一个表单（预约咨询）
        if (contactForms.length > 0) {
            showContactForm('consultation');
        }
        
        // 为选项按钮添加点击事件
        optionButtons.forEach(button => {
            button.addEventListener('click', function() {
                console.log('点击选项按钮:', this.dataset.option);
                const option = this.dataset.option;
                showContactForm(option);
            });
        });
        
        // CTA按钮点击事件
        const ctaButtons = document.querySelectorAll('.contact-cta .btn');
        ctaButtons.forEach(button => {
            button.addEventListener('click', function() {
                console.log('点击CTA按钮:', this.dataset.option);
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
        
        // 绑定表单提交事件
        bindFormEvents();
        
        // 绑定模态框事件
        bindModalEvents();
        
        // 绑定微信相关事件
        bindWechatEvents();
        
        console.log('=== 联系页面初始化完成 ===');
    }
    
    // 显示指定的联系表单
    function showContactForm(optionId) {
        console.log('显示表单:', optionId);
        
        // 隐藏所有表单
        contactForms.forEach(form => {
            form.classList.remove('active');
        });
        
        // 显示指定的表单
        const activeForm = document.getElementById(optionId + '-form');
        if (activeForm) {
            activeForm.classList.add('active');
            
            // 如果切换到微信表单，确保显示表单部分，隐藏二维码部分
            if (optionId === 'wechat') {
                const formSection = activeForm.querySelector('#wechat-form-section');
                const qrSection = activeForm.querySelector('#wechat-qr-section');
                
                if (formSection) {
                    formSection.style.display = 'block';
                    console.log('显示微信表单部分');
                }
                if (qrSection) {
                    qrSection.style.display = 'none';
                    console.log('隐藏微信二维码部分');
                }
            }
            
            // 高亮对应的选项卡片
            if (optionCards) {
                optionCards.forEach(card => {
                    card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                    card.style.borderColor = '#f0f0f0';
                });
                
                const activeCard = document.getElementById(optionId + '-option');
                if (activeCard) {
                    activeCard.style.boxShadow = '0 5px 15px rgba(42, 91, 158, 0.2)';
                    activeCard.style.borderColor = '#2a5b9e';
                }
            }
            
            // 滚动到表单区域
            setTimeout(() => {
                activeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            console.error('未找到表单:', optionId + '-form');
        }
    }
    
    // 绑定表单事件
    function bindFormEvents() {
        console.log('绑定表单事件...');
        
        const forms = [
            { id: 'consultation-form-content', type: 'consultation' },
            { id: 'wechat-form-content', type: 'wechat' },
            { id: 'partnership-form-content', type: 'partnership' },
            { id: 'other-form-content', type: 'other' }
        ];
        
        forms.forEach(formConfig => {
            const form = document.getElementById(formConfig.id);
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('表单提交:', formConfig.id, '类型:', formConfig.type);
                    handleFormSubmit(this, formConfig.type);
                });
                console.log('已绑定表单:', formConfig.id);
            } else {
                console.warn('未找到表单:', formConfig.id);
            }
        });
    }
    
    // 处理表单提交
    function handleFormSubmit(form, formType) {
        console.log('处理表单提交，类型:', formType);
        
        // 获取表单数据
        const formData = getFormData(form, formType);
        console.log('表单数据:', formData);
        
        // 验证表单数据
        if (!validateForm(formData, formType)) {
            console.log('表单验证失败');
            return;
        }
        
        // 显示加载状态
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;
            
            // 模拟提交过程
            setTimeout(() => {
                try {
                    // 保存数据
                    const savedData = saveFormData(formData, formType);
                    console.log('数据已保存:', savedData);
                    
                    // 根据表单类型处理成功响应
                    handleFormSuccess(formType, formData);
                    
                    // 重置表单（微信表单除外）
                    if (formType !== 'wechat') {
                        form.reset();
                    }
                } catch (error) {
                    console.error('提交失败:', error);
                    alert('提交失败，请稍后重试');
                } finally {
                    // 恢复按钮状态（微信表单已隐藏，不需要恢复）
                    if (formType !== 'wechat') {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                }
            }, 1000);
        }
    }
    
    // 验证表单
    function validateForm(formData, formType) {
        console.log('验证表单，类型:', formType);
        
        // 基本验证
        if (!formData || Object.keys(formData).length === 0) {
            alert('请填写表单数据');
            return false;
        }
        
        // 检查必填字段
        const requiredFields = getRequiredFieldsByType(formType);
        const missingFields = [];
        
        requiredFields.forEach(field => {
            const value = formData[field];
            if (!value || value === '' || value === false) {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            alert(`请填写以下必填字段：${missingFields.join(', ')}`);
            return false;
        }
        
        // 验证邮箱格式
        if (formData.email && !isValidEmail(formData.email)) {
            alert('请输入有效的邮箱地址');
            return false;
        }
        
        console.log('表单验证通过');
        return true;
    }
    
    // 处理表单成功
    function handleFormSuccess(formType, formData) {
        console.log('处理表单成功，类型:', formType);
        
        switch(formType) {
            case 'wechat':
                showWechatQR(formData);
                break;
            default:
                showSuccessModal(formType);
                break;
        }
    }
    
    // 显示微信二维码
    function showWechatQR(formData) {
        console.log('显示微信二维码');
        
        const wechatForm = document.getElementById('wechat-form');
        if (!wechatForm) {
            console.error('未找到微信表单');
            return;
        }
        
        const formSection = wechatForm.querySelector('#wechat-form-section');
        const qrSection = wechatForm.querySelector('#wechat-qr-section');
        
        if (formSection && qrSection) {
            // 隐藏表单，显示二维码
            formSection.style.display = 'none';
            qrSection.style.display = 'block';
            console.log('切换显示：隐藏表单，显示二维码');
            
            // 填充备注信息
            const companySpan = document.getElementById('qr-note-company');
            const nameSpan = document.getElementById('qr-note-name');
            
            if (companySpan) {
                companySpan.textContent = formData.company || '公司';
                console.log('设置公司:', formData.company);
            }
            if (nameSpan) {
                nameSpan.textContent = formData.name || '姓名';
                console.log('设置姓名:', formData.name);
            }
            
            // 滚动到二维码区域
            setTimeout(() => {
                qrSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else {
            console.error('未找到表单部分或二维码部分');
            if (!formSection) console.error('未找到: #wechat-form-section');
            if (!qrSection) console.error('未找到: #wechat-qr-section');
        }
    }
    
    // 绑定模态框事件
    function bindModalEvents() {
        const closeSuccessModal = document.getElementById('close-success-modal');
        const successModal = document.getElementById('success-modal');
        const modalClose = document.querySelectorAll('.modal-close');
        
        if (closeSuccessModal) {
            closeSuccessModal.addEventListener('click', closeModal);
        }
        
        if (successModal) {
            successModal.addEventListener('click', function(e) {
                if (e.target === successModal) {
                    closeModal();
                }
            });
        }
        
        modalClose.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
    }
    
    // 绑定微信相关事件
    function bindWechatEvents() {
        // 编辑信息按钮
        const editWechatFormBtn = document.getElementById('edit-wechat-form');
        if (editWechatFormBtn) {
            editWechatFormBtn.addEventListener('click', function() {
                console.log('点击编辑信息按钮');
                const formSection = document.getElementById('wechat-form-section');
                const qrSection = document.getElementById('wechat-qr-section');
                
                if (formSection && qrSection) {
                    qrSection.style.display = 'none';
                    formSection.style.display = 'block';
                    
                    // 滚动到表单顶部
                    setTimeout(() => {
                        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                }
            });
        }
        
        // 下载二维码按钮
        const downloadQrBtn = document.getElementById('download-qr');
        if (downloadQrBtn) {
            downloadQrBtn.addEventListener('click', function() {
                console.log('点击下载二维码');
                const qrImg = document.querySelector('.qr-image img');
                if (qrImg && qrImg.src) {
                    const link = document.createElement('a');
                    link.href = qrImg.src;
                    link.download = '水泥安环智脑-微信二维码.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert('二维码图片未找到或未加载');
                }
            });
        }
    }
    
    // 关闭模态框
    function closeModal() {
        const successModal = document.getElementById('success-modal');
        if (successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // 显示成功模态框
    function showSuccessModal(formType) {
        console.log('显示成功模态框，类型:', formType);
        
        const successModal = document.getElementById('success-modal');
        const successTitle = document.getElementById('success-title');
        const successMessage = document.getElementById('success-message');
        
        if (!successModal || !successTitle || !successMessage) {
            console.error('成功模态框元素未找到');
            alert('提交成功！');
            return;
        }
        
        const messages = {
            'consultation': {
                title: '预约提交成功！',
                message: '我们将在24小时内与您确认咨询时间，请保持电话和邮箱畅通。'
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
        
        const msg = messages[formType] || {
            title: '提交成功！',
            message: '我们将在24小时内与您联系，请保持电话和邮箱畅通。'
        };
        
        successTitle.textContent = msg.title;
        successMessage.textContent = msg.message;
        
        successModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
});

// ========== 工具函数 ==========

// 获取表单数据
function getFormData(form, formType) {
    const formData = {};
    
    // 表单类型到字段前缀的映射
    const prefixMap = {
        'consultation': 'consult',
        'wechat': 'wechat',
        'partnership': 'partner',
        'other': 'other'
    };
    
    const prefix = prefixMap[formType] || '';
    
    // 收集所有表单字段
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
        const originalId = input.id;
        let key = originalId;
        let value;
        
        // 获取值
        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'select-one') {
            value = input.value;
        } else {
            value = input.value.trim();
        }
        
        // 如果键以表单前缀开头，去掉前缀
        if (prefix && key.startsWith(prefix + '-')) {
            key = key.substring(prefix.length + 1);
        }
        
        // 保存到 formData
        formData[key] = value;
    });
    
    return formData;
}

// 根据表单类型获取必填字段
function getRequiredFieldsByType(formType) {
    const requiredMap = {
        'consultation': ['name', 'position', 'company', 'industry', 'email', 'phone', 'service', 'needs', 'time', 'terms'],
        'wechat': ['name', 'company', 'industry', 'purpose', 'terms'],
        'partnership': ['name', 'position', 'company', 'type', 'email', 'phone', 'cooperation', 'description', 'terms'],
        'other': ['name', 'email', 'category', 'subject', 'content', 'terms']
    };
    
    return requiredMap[formType] || [];
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 保存数据到 localStorage
function saveFormData(formData, formType) {
    // 创建标准化的数据对象
    const submission = {
        id: Date.now(),
        type: formType,
        timestamp: new Date().toLocaleString('zh-CN'),
        status: 'pending',
        ...formData
    };
    
    // 获取现有数据
    const storageKey = 'cement_submissions';
    let existingData = [];
    
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            existingData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('解析现有数据失败:', error);
        existingData = [];
    }
    
    // 添加新数据
    existingData.push(submission);
    
    // 保存到 localStorage
    try {
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        return submission;
    } catch (error) {
        console.error('保存到 localStorage 失败:', error);
        throw error;
    }
}

// 调试函数
function debugCheckStorage() {
    console.log('=== 检查 localStorage ===');
    const data = localStorage.getItem('cement_submissions');
    if (data) {
        const parsed = JSON.parse(data);
        console.log(`存储的数据量: ${parsed.length} 条`);
        console.log('最新数据:', parsed[parsed.length - 1]);
    } else {
        console.log('没有存储数据');
    }
}

// 填充测试数据
function fillTestData() {
    console.log('填充测试数据');
    
    // 填充微信表单
    const wechatForm = document.getElementById('wechat-form-content');
    if (wechatForm) {
        document.getElementById('wechat-name').value = '李四';
        document.getElementById('wechat-company').value = '测试公司';
        document.getElementById('wechat-position').value = '经理';
        document.getElementById('wechat-industry').value = 'cement';
        document.getElementById('wechat-purpose').value = 'resource';
        document.getElementById('wechat-terms').checked = true;
        console.log('微信表单测试数据填充完成');
    }
    
    // 填充预约咨询表单
    const consultForm = document.getElementById('consultation-form-content');
    if (consultForm) {
        document.getElementById('consult-name').value = '张三';
        document.getElementById('consult-position').value = '安全主管';
        document.getElementById('consult-company').value = '测试水泥厂';
        document.getElementById('consult-industry').value = 'cement';
        document.getElementById('consult-email').value = 'test@example.com';
        document.getElementById('consult-phone').value = '13800138000';
        document.getElementById('consult-service').value = 'diagnosis';
        document.getElementById('consult-needs').value = '需要数字化安全管理系统';
        document.getElementById('consult-time').value = 'morning';
        document.getElementById('consult-terms').checked = true;
        console.log('预约咨询表单测试数据填充完成');
    }
}

// 确保函数在全局可用
window.debugCheckStorage = debugCheckStorage;
window.fillTestData = fillTestData;