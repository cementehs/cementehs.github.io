// 联系我们页面功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== contact.js 加载 ===');
    
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
    const forms = document.querySelectorAll('form[id$="-content"]');
    console.log('找到的表单数量:', forms.length);
    
    // 为每个表单添加提交事件
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('=== 表单提交开始 ===');
            console.log('表单ID:', this.id);
            
            // 1. 获取表单类型
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
            
            console.log('表单类型:', formType);
            
            // 2. 获取表单数据
            const formData = getFormData(this, formType);
            console.log('提取的表单数据:', formData);
            
            // 3. 验证表单数据
            const isValid = validateFormData(formData, formType);
            if (!isValid) {
                return;
            }
            
            // 4. 显示加载状态
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;
            
            try {
                console.log('开始保存数据...');
                
                // 5. 保存到 localStorage
                const savedData = saveFormData(formData, formType);
                console.log('✅ 数据已保存:', savedData);
                
                // 6. 显示成功消息
                console.log('显示成功消息...');
                showSuccessMessage(formType);
                
                // 7. 重置表单
                console.log('重置表单...');
                this.reset();
                
                // 8. 验证保存
                setTimeout(() => {
                    const stored = localStorage.getItem('cement_submissions');
                    const data = stored ? JSON.parse(stored) : [];
                    console.log('✅ 验证保存: 当前有', data.length, '条数据');
                    
                    if (data.length > 0) {
                        console.log('最后一条数据:', data[data.length - 1]);
                    }
                }, 500);
                
            } catch (error) {
                console.error('提交错误:', error);
                alert('提交失败，请稍后重试');
            } finally {
                // 恢复按钮状态
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
    
    // 模态框关闭事件
    const closeSuccessModal = document.getElementById('close-success-modal');
    const successModal = document.getElementById('success-modal');
    
    function closeModal() {
        if (successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', closeModal);
    }
    
    // 点击模态框外部关闭
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                closeModal();
            }
        });
    }
    
    // 关闭按钮
    const modalClose = document.querySelectorAll('.modal-close');
    modalClose.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
});

// ========== 工具函数 ==========

// 获取表单数据
function getFormData(form, formType) {
    console.log('=== 开始提取表单数据 ===');
    console.log('表单类型:', formType);
    
    const formData = {};
    
    // 表单类型到字段前缀的映射
    const prefixMap = {
        'consultation': 'consult',
        'wechat': 'wechat',
        'partnership': 'partner',
        'other': 'other'
    };
    
    const prefix = prefixMap[formType] || '';
    console.log('字段前缀:', prefix);
    
    // 收集所有表单字段
    const inputs = form.querySelectorAll('input, select, textarea');
    console.log('找到的输入字段数量:', inputs.length);
    
    inputs.forEach((input, index) => {
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
    
    console.log('最终提取的数据:', formData);
    return formData;
}

// 验证表单数据
function validateFormData(formData, formType) {
    console.log('=== 验证表单数据 ===');
    
    // 根据表单类型确定必填字段
    const requiredFields = getRequiredFieldsByType(formType);
    console.log('必填字段:', requiredFields);
    
    const missingFields = [];
    
    // 检查必填字段
    requiredFields.forEach(field => {
        const value = formData[field];
        if (!value || value === '' || value === false) {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        console.error('缺少必要字段:', missingFields);
        alert(`请填写以下必填字段：${missingFields.join(', ')}`);
        return false;
    }
    
    // 验证邮箱格式
    if (formData.email && !isValidEmail(formData.email)) {
        alert('请输入有效的邮箱地址');
        return false;
    }
    
    console.log('✅ 表单数据验证通过');
    return true;
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

// 显示成功消息
function showSuccessMessage(formType) {
    console.log('显示成功消息，类型:', formType);
    
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
    
    const msg = messages[formType] || {
        title: '提交成功！',
        message: '我们将在24小时内与您联系，请保持电话和邮箱畅通。'
    };
    
    successTitle.textContent = msg.title;
    successMessage.textContent = msg.message;
    
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('✅ 成功消息已显示');
}

// 保存数据到 localStorage
// 修改 saveFormData 函数，确保字段名标准化
function saveFormData(formData, formType) {
    console.log('=== 保存数据到 localStorage ===');
    
    // 创建标准化的数据对象
    const submission = {
        id: Date.now(),
        type: formType,
        timestamp: new Date().toLocaleString('zh-CN'),
        status: 'pending',
        ...formData  // 这里包含的是去掉前缀的字段名
    };
    
    console.log('要保存的数据（标准化后）:', submission);
    
    // 获取现有数据
    const storageKey = 'cement_submissions';
    let existingData = [];
    
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            existingData = JSON.parse(stored);
            console.log('现有数据量:', existingData.length);
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
        console.log(`✅ 数据已保存，总数据量: ${existingData.length}`);
        
        // 同时保存一个备份，保持原始字段名
        saveBackupData(formData, formType, submission.id);
        
        return submission;
    } catch (error) {
        console.error('保存到 localStorage 失败:', error);
        throw error;
    }
}

// 保存备份数据（包含原始字段名）
function saveBackupData(formData, formType, id) {
    const backupKey = 'cement_submissions_raw';
    let backupData = [];
    
    try {
        const stored = localStorage.getItem(backupKey);
        if (stored) {
            backupData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('解析备份数据失败:', error);
        backupData = [];
    }
    
    // 保存原始表单数据（带前缀）
    const rawData = {
        id: id,
        type: formType,
        timestamp: new Date().toLocaleString('zh-CN'),
        ...formData
    };
    
    backupData.push(rawData);
    localStorage.setItem(backupKey, JSON.stringify(backupData));
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

// 确保函数在全局可用
window.debugCheckStorage = debugCheckStorage;