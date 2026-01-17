// 智见（博客）页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 博客筛选功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-card, .featured-article');
    const searchInput = document.getElementById('blog-search');
    const searchButton = document.querySelector('.search-btn');
    
    // 筛选函数
    function filterArticles(category, searchTerm = '') {
        let visibleCount = 0;
        
        articles.forEach(article => {
            const articleCategory = article.dataset.category;
            const searchData = article.dataset.search || '';
            const articleText = article.textContent.toLowerCase();
            const articleTitle = article.querySelector('.article-title a')?.textContent.toLowerCase() || '';
            
            // 检查筛选条件
            const matchesCategory = category === 'all' || articleCategory === category;
            
            // 检查搜索条件
            const matchesSearch = !searchTerm || 
                                 searchData.toLowerCase().includes(searchTerm) || 
                                 articleText.includes(searchTerm) ||
                                 articleTitle.includes(searchTerm);
            
            // 显示或隐藏文章
            if (matchesCategory && matchesSearch) {
                article.style.display = 'block';
                visibleCount++;
                
                // 添加动画效果
                setTimeout(() => {
                    article.style.opacity = '1';
                    article.style.transform = 'translateY(0)';
                }, 100);
            } else {
                article.style.opacity = '0';
                article.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    article.style.display = 'none';
                }, 300);
            }
        });
        
        // 如果没有匹配的文章，显示提示
        const noResults = document.getElementById('no-results');
        if (visibleCount === 0) {
            if (!noResults) {
                const container = document.querySelector('.latest-articles');
                const message = document.createElement('div');
                message.id = 'no-results';
                message.className = 'no-results-message';
                message.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <h3>未找到匹配的文章</h3>
                        <p>请尝试其他筛选条件或搜索关键词</p>
                        <button class="btn btn-secondary" id="reset-filters">重置筛选</button>
                    </div>
                `;
                container.appendChild(message);
                
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
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });
        
        // 重置搜索框
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 显示所有文章
        filterArticles('all');
    }
    
    // 为筛选按钮添加事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 执行筛选
            const category = this.dataset.category;
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterArticles(category, searchTerm);
        });
    });
    
    // 搜索功能
    if (searchInput && searchButton) {
        // 搜索按钮点击
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
            filterArticles(activeCategory, searchTerm);
        });
        
        // 输入框回车搜索
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const searchTerm = searchInput.value.toLowerCase();
                const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
                filterArticles(activeCategory, searchTerm);
            }
        });
        
        // 输入框实时搜索（防抖）
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = searchInput.value.toLowerCase();
                const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
                filterArticles(activeCategory, searchTerm);
            }, 300);
        });
    }
    
    // 加载更多文章
    const loadMoreButton = document.getElementById('load-more-articles');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            // 模拟加载更多文章
            this.innerHTML = '<span class="loading-spinner"></span> 加载中...';
            this.disabled = true;
            
            setTimeout(() => {
                // 这里可以添加实际加载更多文章的逻辑
                // 目前只是模拟
                this.innerHTML = '暂无更多文章';
                this.disabled = true;
                this.style.opacity = '0.5';
            }, 1500);
        });
    }
    
    // 订阅表单提交
    const newsletterForm = document.getElementById('blog-newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // 模拟提交成功
                alert(`感谢订阅！我们已向 ${email} 发送了确认邮件。`);
                emailInput.value = '';
            }
        });
    }
    
    // URL参数处理
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const tagParam = urlParams.get('tag');
    const authorParam = urlParams.get('author');
    const searchParam = urlParams.get('search');
    
    // 处理分类参数
    if (categoryParam && ['insight', 'technology', 'management', 'trend'].includes(categoryParam)) {
        // 激活对应的筛选按钮
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === categoryParam) {
                btn.classList.add('active');
            }
        });
        
        // 执行筛选
        filterArticles(categoryParam);
    }
    
    // 处理搜索参数
    if (searchParam) {
        if (searchInput) {
            searchInput.value = searchParam;
        }
        
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
        filterArticles(activeCategory, searchParam.toLowerCase());
    }
    
    // 处理标签参数（模拟）
    if (tagParam) {
        // 这里可以添加标签筛选逻辑
        // 目前只是显示一个提示
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-filter-notice';
        tagElement.innerHTML = `
            <div style="background: #f0f7ff; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid var(--primary-color);">
                <h3>标签: ${tagParam}</h3>
                <p>正在显示包含"${tagParam}"标签的文章 <a href="blog.html" style="color: var(--secondary-color);">清除筛选</a></p>
            </div>
        `;
        
        const filterSection = document.querySelector('.blog-filter');
        if (filterSection) {
            filterSection.parentNode.insertBefore(tagElement, filterSection.nextSibling);
        }
    }
    
    // 处理作者参数（模拟）
    if (authorParam) {
        // 这里可以添加作者筛选逻辑
        // 目前只是显示一个提示
        const authorNames = {
            'zhang': '张工',
            'wang': '王工',
            'li': '李工'
        };
        
        const authorName = authorNames[authorParam] || authorParam;
        
        const authorElement = document.createElement('div');
        authorElement.className = 'author-filter-notice';
        authorElement.innerHTML = `
            <div style="background: #f0f7ff; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid var(--primary-color);">
                <h3>作者专栏: ${authorName}</h3>
                <p>正在显示${authorName}的文章 <a href="blog.html" style="color: var(--secondary-color);">查看所有文章</a></p>
            </div>
        `;
        
        const filterSection = document.querySelector('.blog-filter');
        if (filterSection) {
            filterSection.parentNode.insertBefore(authorElement, filterSection.nextSibling);
        }
    }
    
    // 文章卡片动画
    const articleCards = document.querySelectorAll('.article-card, .featured-article');
    
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
    articleCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // 热门文章点击效果
    const popularArticles = document.querySelectorAll('.popular-article');
    popularArticles.forEach(article => {
        article.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') return; // 如果点击的是链接，不处理
            
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
    });
    
    // 标签云点击效果
    const tagCloudLinks = document.querySelectorAll('.tags-cloud .tag');
    tagCloudLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.textContent;
            
            // 显示加载状态
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="loading-spinner"></span>';
            
            // 模拟加载
            setTimeout(() => {
                window.location.href = this.href;
            }, 500);
        });
    });
    
    // 阅读时间计算（模拟）
    function calculateReadTime() {
        const readTimeElements = document.querySelectorAll('.article-read-time');
        
        readTimeElements.forEach(element => {
            const currentText = element.textContent;
            if (currentText.includes('分钟阅读')) {
                // 已经计算过了，跳过
                return;
            }
            
            // 模拟计算阅读时间
            const article = element.closest('.article-card, .featured-article');
            const excerpt = article?.querySelector('.article-excerpt')?.textContent || '';
            const wordCount = excerpt.length;
            const readTime = Math.max(1, Math.ceil(wordCount / 300)); // 假设每分钟阅读300字
            
            element.textContent = `${readTime}分钟阅读`;
        });
    }
    
    // 初始计算阅读时间
    calculateReadTime();
    
    // 热门文章排名动画
    const popularRanks = document.querySelectorAll('.popular-rank');
    popularRanks.forEach((rank, index) => {
        rank.style.transform = 'scale(0)';
        rank.style.transition = 'transform 0.5s ease';
        
        setTimeout(() => {
            rank.style.transform = 'scale(1)';
        }, index * 200);
    });
    
    // 侧边栏小部件切换（可选功能）
    const sidebarWidgets = document.querySelectorAll('.sidebar-widget');
    sidebarWidgets.forEach(widget => {
        const header = widget.querySelector('.widget-header');
        if (header) {
            header.addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    const content = this.nextElementSibling;
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    });
});