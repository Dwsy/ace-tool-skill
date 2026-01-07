const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACE Tool - Debug UI</title>
    <style>
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
        [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --bg-tertiary: #e5e5e5;
            --text-primary: #333333;
            --text-secondary: #666666;
            --border-color: #ddd;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 2rem;
            transition: background 0.3s, color 0.3s;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            flex: 1;
        }
        .header {
            margin-bottom: 2rem;
        }
        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        .header .subtitle {
            color: var(--text-secondary);
            font-size: 0.875rem;
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
        input[type="text"] {
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
        .lang-btn.active {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }
        .lang-btn:hover:not(.active), .theme-btn:hover {
            border-color: var(--accent);
            color: var(--accent);
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
        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 data-i18n="title">ACE Tool Debug UI</h1>
            <p class="subtitle" data-i18n="subtitle">Semantic code search powered by AugmentCode</p>
        </div>

        <div class="controls">
            <div class="control-group">
                <span class="control-label" data-i18n="project.title">Project Path</span>
                <input type="text" id="projectPath" placeholder="Enter project path (default: current directory)" />
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

        <status-card></status-card>

        <tab-control>
            <div data-tab-content="search" class="tab-content active">
                <div class="query-section">
                    <textarea id="searchQuery" data-i18n="search.placeholder" placeholder="Enter your search query..."></textarea>
                    <br><br>
                    <button class="button" id="searchBtn" onclick="doSearch()" data-i18n="search.button">Search</button>
                </div>
                <div id="searchResults" class="results"></div>
                <div class="examples">
                    <div class="examples-title" data-i18n="search.examples">Quick Examples:</div>
                    <div class="example" onclick="useExample('search', 'Where is the user authentication handled?')" data-i18n="search.ex1">Where is the user authentication handled?</div>
                    <div class="example" onclick="useExample('search', 'How does the loadAll function work?')" data-i18n="search.ex2">How does the loadAll function work?</div>
                    <div class="example" onclick="useExample('search', 'Where is the database connection established?')" data-i18n="search.ex3">Where is the database connection established?</div>
                    <div class="example" onclick="useExample('search', 'How are user sessions managed?')" data-i18n="search.ex4">How are user sessions managed?</div>
                </div>
            </div>

            <div data-tab-content="enhance" class="tab-content">
                <div class="query-section">
                    <textarea id="enhanceQuery" data-i18n="enhance.placeholder" placeholder="Enter your prompt for enhancement..."></textarea>
                    <br><br>
                    <button class="button" id="enhanceBtn" onclick="doEnhance()" data-i18n="enhance.button">Enhance</button>
                </div>
                <div id="enhanceResults" class="results"></div>
                <div class="examples">
                    <div class="examples-title" data-i18n="enhance.examples">Quick Examples:</div>
                    <div class="example" onclick="useExample('enhance', 'Add a login page')" data-i18n="enhance.ex1">Add a login page</div>
                    <div class="example" onclick="useExample('enhance', 'Create a user profile component')" data-i18n="enhance.ex2">Create a user profile component</div>
                    <div class="example" onclick="useExample('enhance', 'Implement error handling')" data-i18n="enhance.ex3">Implement error handling</div>
                    <div class="example" onclick="useExample('enhance', 'Add search functionality')" data-i18n="enhance.ex4">Add search functionality</div>
                </div>
            </div>
        </tab-control>
    </div>

    <script type="module">import { serve } from "bun";

const PORT = process.env.ACE_PORT || 4231;

// ============================================
// 原生 Web Components 实现
// ============================================

/**
 * 主题管理器
 */
class ThemeManager {
  private static instance: ThemeManager;
  private isDarkMode = true;

  private constructor() {}

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  getTheme(): string {
    return this.isDarkMode ? 'dark' : 'light';
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute('data-theme', this.getTheme());
  }

  setTheme(theme: 'dark' | 'light'): void {
    this.isDarkMode = theme === 'dark';
    document.documentElement.setAttribute('data-theme', this.getTheme());
  }
}

/**
 * 国际化管理器
 */
class I18nManager {
  private static instance: I18nManager;
  private currentLang = 'en';

  private translations = {
    en: {
      title: 'ACE Tool Debug UI',
      subtitle: 'Semantic code search powered by AugmentCode',
      status: {
        checking: 'Checking status...',
        online: 'ACE Daemon Online',
        offline: 'ACE Daemon Offline',
        uptime: 'Uptime',
        lastActivity: 'Last Activity',
        remaining: 'Remaining',
        heartbeatTimeout: 'Heartbeat Timeout',
        rpcTimeout: 'RPC Timeout'
      },
      tabs: {
        search: 'Search',
        enhance: 'Enhance Prompt'
      },
      search: {
        placeholder: 'Enter your search query...\n\nExamples:\n- Where is the user authentication handled?\n- How does the payment flow work?\n- Where are API endpoints defined?\n- How are errors handled in this codebase?',
        placeholderShort: 'Search code...',
        button: 'Search',
        searching: 'Searching...',
        noResults: 'No results found',
        examples: 'Quick Examples:',
        ex1: 'Where is the user authentication handled?',
        ex2: 'How does the loadAll function work?',
        ex3: 'Where is the database connection established?',
        ex4: 'How are user sessions managed?'
      },
      enhance: {
        placeholder: 'Enter your prompt for enhancement...\n\nExamples:\n- Add a login page\n- Create a user profile component\n- Implement error handling\n- Add search functionality',
        placeholderShort: 'Enter prompt to enhance...',
        button: 'Enhance',
        enhancing: 'Enhancing...',
        noResult: 'Enhancement not available',
        examples: 'Quick Examples:',
        ex1: 'Add a login page',
        ex2: 'Create a user profile component',
        ex3: 'Implement error handling',
        ex4: 'Add search functionality',
        original: 'Original',
        enhanced: 'Enhanced'
      },
      project: {
        title: 'Project Path',
        select: 'Select project directory...'
      },
      language: 'Language',
      theme: 'Theme',
      error: 'Error: '
    },
    zh: {
      title: 'ACE Tool 调试界面',
      subtitle: '基于 AugmentCode 的语义化代码搜索',
      status: {
        checking: '检查状态...',
        online: 'ACE 守护进程在线',
        offline: 'ACE 守护进程离线',
        uptime: '运行时间',
        lastActivity: '最后活动',
        remaining: '剩余时间',
        heartbeatTimeout: '心跳超时',
        rpcTimeout: 'RPC 超时'
      },
      tabs: {
        search: '搜索',
        enhance: '增强提示词'
      },
      search: {
        placeholder: '输入搜索查询...\n\n示例：\n- 用户认证在哪里处理？\n- 支付流程如何工作？\n- API 端点在哪里定义？\n- 代码中如何处理错误？',
        placeholderShort: '搜索代码...',
        button: '搜索',
        searching: '搜索中...',
        noResults: '未找到结果',
        examples: '快速示例：',
        ex1: '用户认证在哪里处理？',
        ex2: 'loadAll 函数如何工作？',
        ex3: '数据库连接在哪里建立？',
        ex4: '用户会话如何管理？'
      },
      enhance: {
        placeholder: '输入需要增强的提示词...\n\n示例：\n- 添加登录页面\n- 创建用户资料组件\n- 实现错误处理\n- 添加搜索功能',
        placeholderShort: '输入要增强的提示词...',
        button: '增强',
        enhancing: '增强中...',
        noResult: '增强结果不可用',
        examples: '快速示例：',
        ex1: '添加登录页面',
        ex2: '创建用户资料组件',
        ex3: '实现错误处理',
        ex4: '添加搜索功能',
        original: '原始提示词',
        enhanced: '增强后'
      },
      project: {
        title: '项目路径',
        select: '选择项目目录...'
      },
      language: '语言',
      theme: '主题',
      error: '错误：'
    }
  };

  private constructor() {
    // Auto-detect browser language
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    if (browserLang.startsWith('zh')) {
      this.currentLang = 'zh';
    }
  }

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  setLang(lang: 'en' | 'zh'): void {
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('lang-change', { detail: { lang } }));
  }

  getLang(): string {
    return this.currentLang;
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }
}

/**
 * 状态显示组件
 */
class StatusCard extends HTMLElement {
  private themeManager = ThemeManager.getInstance();
  private i18n = I18nManager();
  private refreshInterval: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.startRefresh();
  }

  disconnectedCallback() {
    this.stopRefresh();
  }

  private startRefresh() {
    this.refreshStatus();
    this.refreshInterval = window.setInterval(() => this.refreshStatus(), 10000);
  }

  private stopRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private async refreshStatus() {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      this.updateStatus(data);
    } catch (error) {
      this.updateStatus({ status: 'offline' });
    }
  }

  private updateStatus(data: any) {
    const isOnline = data.status === 'running';
    const dot = this.shadowRoot?.querySelector('.status-dot') as HTMLElement;
    const text = this.shadowRoot?.querySelector('.status-text') as HTMLElement;
    const details = this.shadowRoot?.querySelector('.status-details') as HTMLElement;

    if (dot) {
      dot.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
    }
    if (details && isOnline) {
      details.innerHTML = `
        <div class="detail-item">
          <span class="detail-label">${this.i18n.t('status.uptime')}:</span>
          <span class="detail-value">${Math.floor(data.uptime || 0)}s</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">${this.i18n.t('status.remaining')}:</span>
          <span class="detail-value">${Math.floor(data.remainingMinutes || 0)}m</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">${this.i18n.t('status.heartbeatTimeout')}:</span>
          <span class="detail-value">${data.heartbeatTimeout || 0}m</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">${this.i18n.t('status.rpcTimeout')}:</span>
          <span class="detail-value">${data.rpcTimeout || 0}s</span>
        </div>
      `;
    } else if (details) {
      details.innerHTML = '';
    }
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 2rem;
        }
        .status-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        .status-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: background 0.3s;
        }
        .status-dot.online {
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }
        .status-dot.offline {
          background: var(--error);
          box-shadow: 0 0 8px var(--error);
        }
        .status-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .status-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }
        .detail-label {
          color: var(--text-secondary);
        }
        .detail-value {
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }
      </style>
      <div class="status-card">
        <div class="status-header">
          <div class="status-dot online"></div>
          <span class="status-text">${this.i18n.t('status.checking')}</span>
        </div>
        <div class="status-details"></div>
      </div>
    `;
  }
}

customElements.define('status-card', StatusCard);

/**
 * 搜索结果组件
 */
class SearchResultItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    const file = this.getAttribute('file') || '';
    const score = this.getAttribute('score') || '0';
    const content = this.getAttribute('content') || '';

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 1rem;
        }
        .result-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          transition: border-color 0.2s;
        }
        .result-item:hover {
          border-color: var(--accent);
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
          color: var(--accent);
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
          max-height: 200px;
          overflow-y: auto;
        }
      </style>
      <div class="result-item">
        <div class="result-header">
          <span class="result-file">${this.escapeHtml(file)}</span>
          <span class="result-score">Score: ${parseFloat(score).toFixed(2)}</span>
        </div>
        <div class="result-content">${this.escapeHtml(content)}</div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('search-result-item', SearchResultItem);

/**
 * 增强结果组件
 */
class EnhanceResult extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    const original = this.getAttribute('original') || '';
    const enhanced = this.getAttribute('enhanced') || '';

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 1rem;
        }
        .enhance-result {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        .enhance-header {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .enhance-section {
          margin-bottom: 1rem;
        }
        .enhance-section:last-child {
          margin-bottom: 0;
        }
        .enhance-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .enhance-content {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-all;
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: 6px;
          max-height: 300px;
          overflow-y: auto;
        }
      </style>
      <div class="enhance-result">
        <div class="enhance-header">Enhancement Result</div>
        <div class="enhance-section">
          <div class="enhance-label">Original</div>
          <div class="enhance-content">${this.escapeHtml(original)}</div>
        </div>
        <div class="enhance-section">
          <div class="enhance-label">Enhanced</div>
          <div class="enhance-content">${this.escapeHtml(enhanced)}</div>
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('enhance-result', EnhanceResult);

/**
 * 选项卡组件
 */
class TabControl extends HTMLElement {
  private activeTab = 'search';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  private render() {
    const i18n = I18nManager.getInstance();

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 2rem;
        }
        .tabs {
          display: flex;
          gap: 0.5rem;
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
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
      </style>
      <div class="tabs">
        <button class="tab ${this.activeTab === 'search' ? 'active' : ''}" data-tab="search">
          ${i18n.t('tabs.search')}
        </button>
        <button class="tab ${this.activeTab === 'enhance' ? 'active' : ''}" data-tab="enhance">
          ${i18n.t('tabs.enhance')}
        </button>
      </div>
      <slot></slot>
    `;
  }

  private bindEvents() {
    const tabs = this.shadowRoot?.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabName = target.getAttribute('data-tab');
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });
  }

  private switchTab(tabName: string) {
    this.activeTab = tabName;

    // Update button styles
    const tabs = this.shadowRoot?.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // Update content visibility
    const contents = this.querySelectorAll('[data-tab-content]');
    contents.forEach(content => {
      content.classList.toggle('active', content.getAttribute('data-tab-content') === tabName);
    });

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('tab-change', { detail: { tab: tabName } }));
  }
}

customElements.define('tab-control', TabControl);

// ============================================
// 主 HTML 模板
// ============================================



        const themeManager = ThemeManager.getInstance();
        const i18n = I18nManager.getInstance();
        let currentProjectPath = '';

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateLanguage();
            themeManager.setTheme('dark');
        });

        // Language change handler
        document.addEventListener('lang-change', (e) => {
            updateLanguage();
        });

        function setLanguage(lang) {
            i18n.setLang(lang);
            
            // Update buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.textContent.includes(lang === 'en' ? 'English' : '中文'));
            });
        }

        function toggleTheme() {
            themeManager.toggleTheme();
            const themeBtn = document.querySelector('.theme-btn');
            themeBtn.textContent = themeManager.getTheme() === 'dark' ? '🌙' : '☀️';
        }

        function updateLanguage() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key) el.textContent = i18n.t(key);
            });

            // Update placeholders
            document.getElementById('searchQuery').placeholder = i18n.t('search.placeholder');
            document.getElementById('enhanceQuery').placeholder = i18n.t('enhance.placeholder');
        }

        // Handle project path input
        document.getElementById('projectPath').addEventListener('change', function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                currentProjectPath = files[0].webkitRelativePath;
                console.log('Selected project:', currentProjectPath);
            }
        });

        async function doSearch() {
            const query = document.getElementById('searchQuery').value.trim();
            if (!query) return;

            const resultsDiv = document.getElementById('searchResults');
            const searchBtn = document.getElementById('searchBtn');

            searchBtn.disabled = true;
            searchBtn.textContent = i18n.t('search.searching');
            resultsDiv.innerHTML = '<div class="loading">' + i18n.t('search.searching') + '</div>';

            try {
                const response = await fetch('/call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'tools/call',
                        params: { name: "search_context", arguments: { query, project_root_path: currentProjectPath || process.cwd() } }
                    })
                });

                const data = await response.json();

                if (data.result && data.result.results && data.result.results.length > 0) {
                    resultsDiv.innerHTML = data.result.results.map(r => 
                        \`<search-result-item file="\${r.file}" score="\${r.score}" content="\${r.content}"></search-result-item>\`
                    ).join('');
                } else {
                    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">' + i18n.t('search.noResults') + '</div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="error">' + i18n.t('error') + escapeHtml(error.message) + '</div>';
            }

            searchBtn.disabled = false;
            searchBtn.textContent = i18n.t('search.button');
        }

        async function doEnhance() {
            const query = document.getElementById('enhanceQuery').value.trim();
            if (!query) return;

            const resultsDiv = document.getElementById('enhanceResults');
            const enhanceBtn = document.getElementById('enhanceBtn');

            enhanceBtn.disabled = true;
            enhanceBtn.textContent = i18n.t('enhance.enhancing');
            resultsDiv.innerHTML = '<div class="loading">' + i18n.t('enhance.enhancing') + '</div>';

            try {
                const response = await fetch('/call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'tools/call',
                        params: { name: "search_context", arguments: { query, project_root_path: currentProjectPath || process.cwd() } }
                    })
                });

                const data = await response.json();

                if (data.result && data.result.enhanced) {
                    resultsDiv.innerHTML = \`<enhance-result original="\${query}" enhanced="\${data.result.enhanced}"></enhance-result>\`;
                } else {
                    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">' + i18n.t('enhance.noResult') + '</div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="error">' + i18n.t('error') + escapeHtml(error.message) + '</div>';
            }

            enhanceBtn.disabled = false;
            enhanceBtn.textContent = i18n.t('enhance.button');
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
    </script>
</body>
</html>
`;

// API Routes
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Web UI
  if (url.pathname === "/" || url.pathname === "/web") {
    return new Response(HTML_TEMPLATE, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Health check
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({
      status: "online",
      uptime: process.uptime(),
      lastActivity: new Date().toISOString(),
      remainingMinutes: 120,
      rpcTimeout: 300,
      heartbeatTimeout: 120
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Tool call
  if (url.pathname === "/call" && req.method === "POST") {
    try {
      const body = await req.json();
      const { method, params } = body;

      // Forward to daemon
      const response = await fetch(`http://localhost:${PORT}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ method, params })
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  }

  return new Response("Not Found", { status: 404 });
}

// Start server
console.log(`🚀 ACE Tool Debug UI running on http://localhost:${PORT}`);
console.log(`📝 Open your browser to test ACE Tool`);

serve({
  port: Number(PORT),
  hostname: '0.0.0.0',
  fetch: handleRequest,
});