// 案例与成果页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 案例筛选功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.case-card');
    const searchInput = document.getElementById('case-search');
    const searchButton = document.querySelector('.search-btn');
    
    // 筛选函数
    function filterCases(filter, searchTerm = '') {
        let visibleCount = 0;
        
        caseCards.forEach(card => {
            const categories = card.dataset.category.split(' ');
            const searchData = card.dataset.search || '';
            const cardText = card.textContent.toLowerCase();
            
            // 检查筛选条件
            const matchesFilter = filter === 'all' || categories.includes(filter);
            
            // 检查搜索条件
            const matchesSearch = !searchTerm || 
                                 searchData.toLowerCase().includes(searchTerm) || 
                                 cardText.includes(searchTerm);
            
            // 显示或隐藏卡片
            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
                
                // 添加动画效果
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        // 如果没有匹配的案例，显示提示
        const noResults = document.getElementById('no-results');
        if (visibleCount === 0) {
            if (!noResults) {
                const container = document.querySelector('.cases-grid');
                const message = document.createElement('div');
                message.id = 'no-results';
                message.className = 'no-results-message';
                message.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <h3>未找到匹配的案例</h3>
                        <p>请尝试其他筛选条件或搜索关键词</p>
                        <button class="btn btn-secondary" id="reset-filters">重置筛选</button>
                    </div>
                `;
                container.parentNode.insertBefore(message, container.nextSibling);
                
                // 添加重置按钮事件
                document.getElementById('reset-filters').addEventListener('click', function() {
                    resetFilters();
                });
            }
        } else if (noResults) {
            noResults.remove();
        }
    }
    
    // 重置筛选
    function resetFilters() {
        // 重置按钮状态
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
        
        // 重置搜索框
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 显示所有案例
        filterCases('all');
    }
    
    // 为筛选按钮添加事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 执行筛选
            const filter = this.dataset.filter;
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterCases(filter, searchTerm);
        });
    });
    
    // 搜索功能
    if (searchInput && searchButton) {
        // 搜索按钮点击
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            filterCases(activeFilter, searchTerm);
        });
        
        // 输入框回车搜索
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const searchTerm = searchInput.value.toLowerCase();
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                filterCases(activeFilter, searchTerm);
            }
        });
        
        // 输入框实时搜索（防抖）
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = searchInput.value.toLowerCase();
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                filterCases(activeFilter, searchTerm);
            }, 300);
        });
    }
    
    // 加载更多案例
    const loadMoreButton = document.getElementById('load-more-cases');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            // 模拟加载更多案例
            this.innerHTML = '<span class="loading-spinner"></span> 加载中...';
            this.disabled = true;
            
            setTimeout(() => {
                // 这里可以添加实际加载更多案例的逻辑
                // 目前只是模拟
                this.innerHTML = '暂无更多案例';
                this.disabled = true;
                this.style.opacity = '0.5';
            }, 1500);
        });
    }
    
    // 案例详情模态框
    const modal = document.getElementById('case-detail-modal');
    const modalBody = document.getElementById('modal-body');
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const modalClose = document.querySelector('.modal-close');
    
    // 案例详情数据
    const caseDetails = {
        'case-detail-1': {
            title: '某大型水泥集团安全生产数字化蓝图规划',
            content: `
                <div class="case-detail">
                    <div class="detail-header">
                        <h2>某大型水泥集团安全生产数字化蓝图规划</h2>
                        <div class="detail-meta">
                            <span class="detail-badge">诊断规划</span>
                            <span class="detail-duration">2023年 · 4周</span>
                        </div>
                    </div>
                    
                    <div class="detail-content">
                        <section>
                            <h3>项目背景</h3>
                            <p>该集团是中国水泥行业的龙头企业之一，拥有8个生产基地，年产能超过3000万吨。随着集团规模的扩大，各工厂在安全生产数字化建设上各自为政，缺乏统一规划和标准，导致系统孤岛、数据无法共享、重复投资等问题日益突出。</p>
                        </section>
                        
                        <section>
                            <h3>我们的工作</h3>
                            <ul>
                                <li><strong>现状诊断：</strong>对集团8个生产基地进行现场调研，评估各工厂安全生产数字化现状</li>
                                <li><strong>需求分析：</li>
                                <li><strong>蓝图设计：</strong>设计集团级安全生产数字化平台架构，制定"1+N"实施策略</li>
                                <li><strong>路线规划：</strong>制定3年分阶段实施路线图，明确各阶段目标、重点任务和投资预算</li>
                                <li><strong>标准制定：</strong>制定集团统一的数据标准、技术规范和集成规范</li>
                            </ul>
                        </section>
                        
                        <section>
                            <h3>关键成果</h3>
                            <div class="detail-results">
                                <div class="result-item">
                                    <div class="result-icon">🎯</div>
                                    <div class="result-content">
                                        <h4>统一战略方向</h4>
                                        <p>明确了集团安全生产数字化的总体目标、实施原则和重点方向</p>
                                    </div>
                                </div>
                                
                                <div class="result-item">
                                    <div class="result-icon">💰</div>
                                    <div class="result-content">
                                        <h4>避免重复投资</h4>
                                        <p>通过统一规划，预计可避免各工厂重复投资约¥800万元</p>
                                    </div>
                                </div>
                                
                                <div class="result-item">
                                    <div class="result-icon">📊</div>
                                    <div class="result-content">
                                        <h4>实施路线图</h4>
                                        <p>制定了详细的3年实施计划，包括各阶段重点任务、时间节点和资源配置</p>
                                    </div>
                                </div>
                                
                                <div class="result-item">
                                    <div class="result-icon">🤝</div>
                                    <div class="result-content">
                                        <h4>高层认可</h4>
                                        <p>方案获得集团董事长、总经理及各基地负责人的一致认可</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <section>
                            <h3>客户反馈</h3>
                            <div class="detail-testimonial">
                                <p>"智脑君团队为我们制定的数字化蓝图不仅专业可行，更重要的是充分考虑了集团各基地的实际情况，既有统一性又保留灵活性。这为我们未来3-5年的数字化建设指明了方向，避免了走弯路。"</p>
                                <div class="testimonial-author">
                                    <strong>—— 某水泥集团安全总监</strong>
                                </div>
                            </div>
                        </section>
                        
                        <section>
                            <h3>下一步行动</h3>
                            <p>基于蓝图规划，该集团已启动第一期试点项目，选择两个基地进行智能巡检系统的建设，计划在6个月内完成试点，验证效果后在全集团推广。</p>
                        </section>
                    </div>
                    
                    <div class="detail-footer">
                        <p>想了解如何为您的企业制定数字化蓝图？</p>
                        <a href="contact.html" class="btn btn-primary">预约专家咨询</a>
                    </div>
                </div>
            `
        },
        // 可以添加更多案例详情
    };
    
    // 打开案例详情
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const caseId = this.getAttribute('href').substring(1);
            
            if (caseDetails[caseId]) {
                modalBody.innerHTML = caseDetails[caseId].content;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                // 如果没有详细内容，跳转到联系页面
                window.location.href = 'contact.html';
            }
        });
    });
    
    // 关闭模态框
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // URL参数处理
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam && ['diagnosis', 'selection', 'implementation', 'inspection', 'high-risk', 'contractor'].includes(filterParam)) {
        // 激活对应的筛选按钮
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filterParam) {
                btn.classList.add('active');
            }
        });
        
        // 执行筛选
        filterCases(filterParam);
    }
    
    // 动画效果
    const caseCardsAnimated = document.querySelectorAll('.case-card');
    
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
    caseCardsAnimated.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // 客户证言轮播（简化版）
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;
    
    function rotateTestimonials() {
        testimonialCards.forEach((card, index) => {
            card.style.opacity = index === currentTestimonial ? '1' : '0.5';
            card.style.transform = index === currentTestimonial ? 'scale(1)' : 'scale(0.95)';
        });
        
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
    }
    
    // 每5秒切换一次
    if (testimonialCards.length > 1) {
        setInterval(rotateTestimonials, 5000);
    }
});