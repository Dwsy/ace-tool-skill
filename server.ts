import { serve } from "bun";
import { readFile } from "fs/promises";
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

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #0a0a0a;
            color: #e5e5e5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            flex: 1;
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #fff;
        }

        .subtitle {
            color: #666;
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }

        .query-section {
            margin-bottom: 2rem;
        }

        textarea {
            width: 100%;
            min-height: 120px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1rem;
            color: #e5e5e5;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
            resize: vertical;
            transition: border-color 0.2s;
        }

        textarea:focus {
            outline: none;
            border-color: #3b82f6;
        }

        textarea::placeholder {
            color: #666;
        }

        .button {
            background: #3b82f6;
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
            background: #333;
            cursor: not-allowed;
        }

        .results {
            margin-top: 2rem;
        }

        .result-item {
            background: #1a1a1a;
            border: 1px solid #333;
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
            color: #666;
        }

        .result-content {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.75rem;
            color: #a3a3a3;
            white-space: pre-wrap;
            word-break: break-all;
            line-height: 1.6;
        }

        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }

        .error {
            background: #450a0a;
            border: 1px solid #7f1d1d;
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
            background: #1a1a1a;
            border-radius: 6px;
            font-size: 0.75rem;
            margin-bottom: 2rem;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
        }

        .status-dot.offline {
            background: #ef4444;
        }

        .status-text {
            color: #666;
        }

        .examples {
            margin-top: 2rem;
            padding: 1rem;
            background: #1a1a1a;
            border-radius: 8px;
        }

        .examples-title {
            font-size: 0.75rem;
            color: #666;
            margin-bottom: 0.75rem;
        }

        .example {
            color: #3b82f6;
            font-size: 0.75rem;
            cursor: pointer;
            margin-bottom: 0.5rem;
        }

        .example:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ACE Tool Debug UI</h1>
        <p class="subtitle">Semantic code search powered by AugmentCode</p>

        <div class="status">
            <div class="status-dot" id="statusDot"></div>
            <span class="status-text" id="statusText">Checking status...</span>
        </div>

        <div class="query-section">
            <textarea id="query" placeholder="Enter your search query...

Examples:
- Where is the user authentication handled?
- How does the payment flow work?
- Where are API endpoints defined?
- How are errors handled in this codebase?"></textarea>
            <br><br>
            <button class="button" id="searchBtn" onclick="search()">Search</button>
        </div>

        <div id="results"></div>

        <div class="examples">
            <div class="examples-title">Quick Examples:</div>
            <div class="example" onclick="useExample('Where is the user authentication handled?')">Where is the user authentication handled?</div>
            <div class="example" onclick="useExample('How does the payment flow work?')">How does the payment flow work?</div>
            <div class="example" onclick="useExample('Where are API endpoints defined?')">Where are API endpoints defined?</div>
            <div class="example" onclick="useExample('How are errors handled in this codebase?')">How are errors handled in this codebase?</div>
        </div>
    </div>

    <script>
        async function checkStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');
                
                if (data.status === 'online') {
                    dot.classList.remove('offline');
                    text.textContent = 'ACE Server Online';
                } else {
                    dot.classList.add('offline');
                    text.textContent = 'ACE Server Offline';
                }
            } catch (error) {
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');
                dot.classList.add('offline');
                text.textContent = 'ACE Server Offline';
            }
        }

        async function search() {
            const query = document.getElementById('query').value.trim();
            if (!query) return;

            const resultsDiv = document.getElementById('results');
            const searchBtn = document.getElementById('searchBtn');

            searchBtn.disabled = true;
            searchBtn.textContent = 'Searching...';
            resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
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
                    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No results found</div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="error">Error: ' + escapeHtml(error.message) + '</div>';
            }

            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
        }

        function useExample(example) {
            document.getElementById('query').value = example;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Check status on load
        checkStatus();
        setInterval(checkStatus, 10000);
    </script>
</body>
</html>
`;

// API Routes
async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Serve HTML
    if (url.pathname === '/') {
        return new Response(HTML_TEMPLATE, {
            headers: { 'Content-Type': 'text/html' },
        });
    }

    // Status endpoint
    if (url.pathname === '/api/status') {
        try {
            // Check if daemon is running
            const response = await fetch(`${process.env.ACE_BASE_URL}/health`, {
                headers: {
                    'Authorization': `Bearer ${process.env.ACE_API_KEY}`,
                },
            });

            const data = await response.json();
            
            return new Response(JSON.stringify({ status: 'online' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ status: 'offline', error: (error as Error).message }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // Search endpoint
    if (url.pathname === '/api/search') {
        try {
            const body = await req.json();
            const query = body.query;

            if (!query) {
                return new Response(JSON.stringify({ error: 'Query is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Call ACE MCP server
            const response = await fetch(`${process.env.ACE_BASE_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ACE_API_KEY}`,
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: (error as Error).message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // 404
    return new Response('Not Found', { status: 404 });
}

// Start server
console.log(`🚀 ACE Tool Debug UI running on http://localhost:${PORT}`);
console.log(`📝 Open your browser to test ACE Tool`);

serve(handleRequest, {
    port: Number(PORT),
    hostname: '0.0.0.0',
});