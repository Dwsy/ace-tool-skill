import { serve } from "bun";
import { readdirSync } from "fs";
import { join } from "path";

const PORT = process.env.ACE_PORT || 4231;

// HTML template for the web UI
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACE Tool - Debug UI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #1a1a1a;
            --bg-tertiary: #2a2a2a;
            --text-primary: #e5e5e5;
            --text-secondary: #666;
            --accent: #3b82f6;
            --border-color: #333;
            --success: #22c55e;
            --error: #ef4444;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            transition: background 0.3s, color 0.3s;
        }

        body.light-mode {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --bg-tertiary: #e5e5e5;
            --text-primary: #333333;
            --text-secondary: #666666;
            --border-color: #ddd;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            flex: 1;
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }

        .controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .control-group {
            flex: 1;
            min-width: 200px;
        }

        .control-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            display: block;
        }

        input[type="file"] {
            width: 100%;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            color: var(--text-primary);
            font-size: 0.875rem;
            font-family: inherit;
            cursor: pointer;
        }

        input[type="file"]:focus {
            outline: none;
            border-color: var(--accent);
        }

        input[type="file"]::file-selector-button {
            background: var(--bg-tertiary);
            color: var(--text-secondary);
        }

        select {
            width: 100%;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            color: var(--text-primary);
            font-size: 0.875rem;
            font-family: inherit;
            cursor: pointer;
        }

        select:focus {
            outline: none;
            border-color: var(--accent);
        }

        .language-toggle {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .lang-btn, .theme-btn {
            padding: 0.5rem 1rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-secondary);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .lang-btn.active, .theme-btn:active {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }

        .lang-btn:hover:not(.active), .theme-btn:hover:not(.active) {
            border-color: var(--accent);
            color: var(--accent);
        }

        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }

        .tab {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.875rem;
            cursor: pointer;
            border-radius: 6px 6px 0 0;
            transition: all 0.2s;
        }

        .tab:hover {
            color: var(--text-primary);
            background: var(--bg-secondary);
        }

        .tab.active {
            color: var(--text-primary);
            background: var(--accent);
        }

        .query-section {
            margin-bottom: 2rem;
        }

        textarea {
            width: 100%;
            min-height: 120px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            color: var(--text-primary);
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
            resize: vertical;
            transition: border-color 0.2s;
        }

        textarea:focus {
            outline: none;
            border-color: var(--accent);
        }

        textarea::placeholder {
            color: var(--text-secondary);
        }

        .button {
            background: var(--accent);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }

        .button:hover {
            background: #2563eb;
        }

        .button:disabled {
            background: var(--bg-tertiary);
            cursor: not-allowed;
        }

        .results {
            margin-top: 2rem;
        }

        .result-item {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .result-file {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.75rem;
            color: #60a5fa;
        }

        .result-score {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .result-content {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            white-space: pre-wrap;
            word-break: break-all;
            line-height: 1.6;
        }

        .loading {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
        }

        .error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: #fca5a5;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }

        .status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--bg-secondary);
            border-radius: 6px;
            font-size: 0.75rem;
            margin-bottom: 2rem;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success);
        }

        .status-dot.offline {
            background: var(--error);
        }

        .status-text {
            color: var(--text-secondary);
        }

        .examples {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 8px;
        }

        .examples-title {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
        }

        .example {
            color: var(--accent);
            font-size: 0.75rem;
            cursor: pointer;
            margin-bottom: 0.5rem;
        }

        .example:hover {
            text-decoration: underline;
        }

        .enhance-section {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .enhance-title {
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .enhance-result {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 1rem;
            margin-top: 1rem;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.75rem;
            color: var(--text-secondary);
            white-space: pre-wrap;
            word-break: break-all;
        }

        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 data-i18n="title">ACE Tool Debug UI</h1>
        <p class="subtitle" data-i18n="subtitle">Semantic code search powered by AugmentCode</p>

        <div class="controls">
            <div class="control-group">
                <span class="control-label" data-i18n="projectPath">Project Path</span>
                <input type="file" id="projectPath" webkitdirectory directory />
            </div>

            <div class="control-group">
                <span class="control-label" data-i18n="language">Language</span>
                <div class="language-toggle">
                    <button type="button" class="lang-btn active" onclick="setLanguage('en')">English</button>
                    <button type="button" class="lang-btn" onclick="setLanguage('zh')">中文</button>
                </div>
            </div>

            <div class="control-group">
                <span class="control-label" data-i18n="theme">Theme</span>
                <div class="theme-toggle">
                    <button type="button" class="theme-btn" onclick="toggleTheme()">🌙</button>
                </div>
            </div>
        </div>

        <div class="status">
            <div class="status-dot" id="statusDot"></div>
            <span class="status-text" id="statusText" data-i18n="checkingStatus">Checking status...</span>
        </div>

        <div class="tabs">
            <button type="button" class="tab active" data-tab="search" onclick="switchTab('search')" data-i18n="searchTab">Search</button>
            <button type="button" class="tab" data-tab="enhance" onclick="switchTab('enhance')" data-i18n="enhanceTab">Enhance Prompt</button>
        </div>

        <div id="searchSection" class="query-section">
            <textarea id="searchQuery" data-i18n="searchPlaceholder" placeholder="Enter your search query...

Examples:
- Where is the user authentication handled?
- How does the payment flow work?
- Where are API endpoints defined?
- How are errors handled in this codebase?"></textarea>
            <br><br>
            <button class="button" id="searchBtn" onclick="search()" data-i18n="searchBtn">Search</button>
        </div>

        <div id="enhanceSection" class="query-section hidden">
            <textarea id="enhanceQuery" data-i18n="enhancePlaceholder" placeholder="Enter your prompt for enhancement...

Examples:
- Add a login page
- Create a user profile component
- Implement error handling
- Add search functionality"></textarea>
            <br><br>
            <button class="button" id="enhanceBtn" onclick="enhance()" data-i18n="enhanceBtn">Enhance</button>
        </div>

        <div id="results"></div>

        <div class="examples">
            <div class="examples-title" data-i18n="quickExamples">Quick Examples:</div>
            <div class="example" onclick="useExample('search', 'Where is the user authentication handled?')" data-i18n="ex1">Where is the user authentication handled?</div>
            <div class="example" onclick="useExample('search', 'How does the loadAll function work?')" data-i18n="ex2">How does the loadAll function work?</div>
            <div class="example" onclick="useExample('search', 'Where is the database connection established?')" data-i18n="ex3">Where is the database connection established?</div>
            <div class="example" onclick="useExample('search', 'How are user sessions managed?')" data-i18n="ex4">How are user sessions managed?</div>
        </div>
    </div>

    <script>
        let currentLanguage = 'en';
        let currentProjectPath = '';
        let isDarkMode = true;

        const i18n = {
            en: {
                title: 'ACE Tool Debug UI',
                subtitle: 'Semantic code search powered by AugmentCode',
                projectPath: 'Project Path',
                language: 'Language',
                selectProject: 'Select project...',
                theme: 'Theme',
                checkingStatus: 'Checking status...',
                statusOnline: 'ACE Server Online',
                statusOffline: 'ACE Server Offline',
                searchTab: 'Search',
                enhanceTab: 'Enhance Prompt',
                searchPlaceholder: 'Enter your search query...

Examples:
- Where is the user authentication handled?
- How does the payment flow work?
- Where are API endpoints defined?
- How are errors handled in this codebase?',
                searchBtn: 'Search',
                enhancePlaceholder: 'Enter your prompt for enhancement...

Examples:
- Add a login page
- Create a user profile component
- Implement error handling
- Add search functionality',
                enhanceBtn: 'Enhance',
                quickExamples: 'Quick Examples:',
                ex1: 'Where is the user authentication handled?',
                ex2: 'How does the loadAll function work?',
                ex3: 'Where is the database connection established?',
                ex4: 'How are user sessions managed?',
                searching: 'Searching...',
                noResults: 'No results found',
                error: 'Error: ',
                searchingEnhance: 'Enhancing...',
                enhancementComplete: 'Enhancement complete!'
            },
            zh: {
                title: 'ACE Tool 调试界面',
                subtitle: '基于 AugmentCode 的语义化代码搜索',
                projectPath: '项目路径',
                language: '语言',
                selectProject: '选择项目...',
                theme: '主题',
                checkingStatus: '检查状态...',
                statusOnline: 'ACE 服务器在线',
                statusOffline: 'ACE 服务器离线',
                searchTab: '搜索',
                enhanceTab: '增强提示词',
                searchPlaceholder: '输入搜索查询...

示例：
- 用户认证在哪里处理？
- 支付流程如何工作？
- API 端点在哪里定义？
- 代码中如何处理错误？',
                searchBtn: '搜索',
                enhancePlaceholder: '输入需要增强的提示词...

示例：
- 添加登录页面
- 创建用户资料组件
- 实现错误处理
- 添加搜索功能',
                enhanceBtn: '增强',
                quickExamples: '快速示例：',
                ex1: '用户认证在哪里处理？',
                ex2: 'loadAll 函数如何工作？',
                ex3: '数据库连接在哪里建立？',
                ex4: '用户会话如何管理？',
                searching: '搜索中...',
                noResults: '未找到结果',
                error: '错误：',
                searchingEnhance: '增强中...',
                enhancementComplete: '增强完成！'
            }
        };

        // Auto-detect browser language
        function detectLanguage() {
            const browserLang = navigator.language || navigator.userLanguage || 'en';
            if (browserLang.startsWith('zh')) {
                setLanguage('zh');
            } else {
                setLanguage('en');
            }
        }

        function setLanguage(lang) {
            currentLanguage = lang;
            
            // Update language buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const langBtn = document.querySelector(\`.lang-btn[onclick*="' + lang + '"\"]\`);
            if (langBtn) langBtn.classList.add('active');
            
            // Update UI text
            updateLanguage();
        }

        function toggleTheme() {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('light-mode');
            const themeBtn = document.querySelector('.theme-btn');
            themeBtn.textContent = isDarkMode ? '🌙' : '☀️';
        }

        function updateLanguage() {
            const lang = i18n[currentLanguage];
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (lang[key]) {
                    el.textContent = lang[key];
                }
            });

            // Update placeholders
            const searchQuery = document.getElementById('searchQuery');
            const enhanceQuery = document.getElementById('enhanceQuery');
            
            if (lang.searchPlaceholder) {
                searchQuery.placeholder = lang.searchPlaceholder;
            }
            if (lang.enhancePlaceholder) {
                enhanceQuery.placeholder = lang.enhancePlaceholder;
            }

            // Update buttons
            const searchBtn = document.getElementById('searchBtn');
            const enhanceBtn = document.getElementById('enhanceBtn');
            
            if (lang.searchBtn && lang.searchBtn) {
                searchBtn.textContent = lang.searchBtn;
            }
            if (lang.enhanceBtn && lang.enhanceBtn) {
                enhanceBtn.textContent = lang.enhanceBtn;
            }
        }

        function switchTab(tab) {
            const searchSection = document.getElementById('searchSection');
            const enhanceSection = document.getElementById('enhanceSection');
            const tabs = document.querySelectorAll('.tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            const targetTab = document.querySelector(\`.tab[data-tab="${tab}"]\`);
            if (targetTab) targetTab.classList.add('active');
            
            if (tab === 'search') {
                searchSection.classList.remove('hidden');
                enhanceSection.classList.add('hidden');
            } else {
                searchSection.classList.add('hidden');
                enhanceSection.classList.remove('hidden');
            }
        }

        // Handle project selection
        document.getElementById('projectPath').addEventListener('change', function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                currentProjectPath = files[0].webkitRelativePath;
                console.log('Selected project:', currentProjectPath);
            }
        });

        async function checkStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                const lang = i18n[currentLanguage];
                
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');
                
                if (data.status === 'online') {
                    dot.classList.remove('offline');
                    text.textContent = lang.statusOnline;
                } else {
                    dot.classList.add('offline');
                    text.textContent = lang.statusOffline;
                }
            } catch (error) {
                const lang = i18n[currentLanguage];
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');
                dot.classList.add('offline');
                text.textContent = lang.statusOffline;
            }
        }

        async function search() {
            const query = document.getElementById('searchQuery').value.trim();
            if (!query) return;

            const resultsDiv = document.getElementById('results');
            const searchBtn = document.getElementById('searchBtn');
            const lang = i18n[currentLanguage];

            searchBtn.disabled = true;
            searchBtn.textContent = lang.searching;
            resultsDiv.innerHTML = '<div class="loading">' + lang.searching + '</div>';

            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        query,
                        projectPath: currentProjectPath 
                    }),
                });

                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const resultsHTML = data.results.map(result => {
                        return '<div class="result-item">' +
                            '<div class="result-header">' +
                                '<span class="result-file">' + (result.file || 'Unknown') + '</span>' +
                                '<span class="result-score">Score: ' + ((result.score || 0).toFixed(2)) + '</span>' +
                            '</div>' +
                            '<div class="result-content">' + escapeHtml(result.content || 'No content available') + '</div>' +
                        '</div>';
                    }).join('');
                    
                    resultsDiv.innerHTML = '<div class="results">' + resultsHTML + '</div>';
                } else {
                    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">' + lang.noResults + '</div>';
                }
            } catch (error) {
                const lang = i18n[currentLanguage];
                resultsDiv.innerHTML = '<div class="error">' + lang.error + escapeHtml(error.message) + '</div>';
            }

            searchBtn.disabled = false;
            searchBtn.textContent = lang.searchBtn;
        }

        async function enhance() {
            const query = document.getElementById('enhanceQuery').value.trim();
            if (!query) return;

            const resultsDiv = document.getElementById('results');
            const enhanceBtn = document.getElementById('enhanceBtn');
            const lang = i18n[currentLanguage];

            enhanceBtn.disabled = true;
            enhanceBtn.textContent = lang.searchingEnhance;
            resultsDiv.innerHTML = '<div class="loading">' + lang.searchingEnhance + '</div>';

            try {
                const response = await fetch('/api/enhance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        query,
                        projectPath: currentProjectPath 
                    }),
                });

                const data = await response.json();

                const enhanceResultDiv = document.createElement('div');
                enhanceResultDiv.className = 'enhance-result';
                enhanceResultDiv.innerHTML = '<div class="enhance-title">' + lang.enhancementComplete + '</div>' +
                    '<pre>' + escapeHtml(data.enhanced || 'No enhancement available') + '</pre>';

                resultsDiv.innerHTML = '';
                resultsDiv.appendChild(enhanceResultDiv);
            } catch (error) {
                const lang = i18n[currentLanguage];
                resultsDiv.innerHTML = '<div class="error">' + lang.error + escapeHtml(error.message) + '</div>';
            }

            enhanceBtn.disabled = false;
            enhanceBtn.textContent = lang.enhanceBtn;
        }

        function useExample(type, example) {
            if (type === 'search') {
                document.getElementById('searchQuery').value = example;
            } else {
                document.getElementById('enhanceQuery').value = example;
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Initialize
        detectLanguage();
        checkStatus();
        setInterval(checkStatus, 10000);
        updateLanguage();
    </script>
</body>
</html>
`;

// API Routes
async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

    // Serve HTML
    if (url.pathname === '/' || url.pathname === '/index.html') {
        console.log('[INFO] Serving HTML page');
        return new Response(HTML_TEMPLATE, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }

    // Status endpoint
    if (url.pathname === '/api/status') {
        console.log('[INFO] Status endpoint called');
        try {
            // Check if daemon is running
            const response = await fetch(`${process.env.ACE_BASE_URL}/health`, {
                headers: {
                    'Authorization': `Bearer ${process.env.ACE_API_KEY}`,
                },
            });

            const data = await response.json();
            
            console.log('[INFO] ACE server status:', data);
            
            return new Response(JSON.stringify({ status: 'online' }), {
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        } catch (error) {
            console.error('[ERROR] ACE server offline:', error);
            return new Response(JSON.stringify({ status: 'offline', error: (error as Error).message }), {
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        }
    }

    // Projects endpoint
    if (url.pathname === '/api/projects') {
        console.log('[INFO] Projects endpoint called');
        try {
            const cwd = process.cwd();
            const directories = readdirSync(cwd, { withFileTypes: true });
            
            const projects = directories
                .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
                .map(d => ({
                    name: d.name,
                    path: join(cwd, d.name)
                }));
            
            return new Response(JSON.stringify({ projects }), {
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ projects: [] }), {
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        }
    }

    // Search endpoint
    if (url.pathname === '/api/search') {
        console.log('[INFO] Search endpoint called');
        try {
            const body = await req.json();
            const query = body.query;
            const projectPath = body.projectPath || process.cwd();

            if (!query) {
                return new Response(JSON.stringify({ error: 'Query is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                });
            }

            console.log('[INFO] Search query:', query);
            console.log('[INFO] Project path:', projectPath);

            // Call ACE MCP server
            const response = await fetch(`${process.env.ACE_BASE_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${process.env.ACE_API_KEY}`,
                },
                body: JSON.stringify({ query, context: projectPath }),
            });

            const data = await response.json();

            console.log('[INFO] Search results:', data.results?.length || 0);

            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        } catch (error) {
            console.error('[ERROR] Search failed:', error);
            return new Response(JSON.stringify({ error: (error as Error).message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        }
    }

    // Enhance endpoint
    if (url.pathname === '/api/enhance') {
        console.log('[INFO] Enhance endpoint called');
        try {
            const body = await req.json();
            const query = body.query;
            const projectPath = body.projectPath || process.cwd();

            if (!query) {
                return new Response(JSON.stringify({ error: 'Query is required' }), {
                    status: 400,
                    headers: { 'Content-Type: 'application/json; charset=utf-8' },
                });
            }

            console.log('[INFO] Enhance query:', query);
            console.log('[INFO] Project path:', projectPath);

            // Call ACE MCP server
            const response = await fetch(`${process.env.ACE_BASE_URL}/enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${process.env.ACE_API_KEY}`,
                },
                body: JSON.stringify({ query, context: projectPath }),
            });

            const data = await response.json();

            console.log('[INFO] Enhance results:', data);

            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        } catch (error) {
            console.error('[ERROR] Enhance failed:', error);
            return new Response(JSON.stringify({ error: (error as Error).message }), {
                status: 500,
                headers: { Content-Type: 'application/json; charset=utf-8' },
            });
        }
    }

    // 404 for unknown routes
    console.log('[WARN] 404 for:', url.pathname);
    return new Response('Not Found', { status: 404 });
}

// Start server
console.log(`🚀 ACE Tool Debug UI running on http://localhost:${PORT}`);
console.log(`📝 Open your browser to test ACE Tool`);

serve({
    port: Number(PORT),
    hostname: '0.0.0.0',
    fetch: handleRequest,
});