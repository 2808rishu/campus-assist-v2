/**
 * ERP-Agnostic Integration Framework
 * Enables seamless integration with various college ERP systems
 * Supports iframe embedding, REST APIs, and webhook integrations
 */

export class ERPIntegrationFramework {
    constructor() {
        this.integrations = new Map();
        this.supportedSystems = [
            'generic_rest',
            'iframe_embed',
            'websocket',
            'csv_import',
            'json_api',
            'xml_feed'
        ];
        this.activeConnections = new Set();
        this.dataTransformers = new Map();
        this.authHandlers = new Map();
    }

    /**
     * Register a new ERP integration
     * @param {string} systemId - Unique identifier for the ERP system
     * @param {Object} config - Integration configuration
     */
    registerIntegration(systemId, config) {
        const integration = {
            id: systemId,
            type: config.type || 'generic_rest',
            endpoint: config.endpoint,
            authMethod: config.authMethod || 'none',
            credentials: config.credentials || {},
            dataFormat: config.dataFormat || 'json',
            transformer: config.transformer,
            webhookUrl: config.webhookUrl,
            iframe: config.iframe || {},
            polling: config.polling || { enabled: false, interval: 300000 }, // 5 minutes default
            registeredAt: new Date().toISOString(),
            lastSync: null,
            status: 'inactive'
        };

        this.integrations.set(systemId, integration);
        
        // Register data transformer if provided
        if (config.transformer) {
            this.dataTransformers.set(systemId, config.transformer);
        }

        // Register auth handler if provided
        if (config.authHandler) {
            this.authHandlers.set(systemId, config.authHandler);
        }

        console.log(`ERP integration registered: ${systemId}`);
        return integration;
    }

    /**
     * Create iframe embedding configuration
     * @param {string} systemId - ERP system identifier
     * @param {Object} iframeConfig - Iframe configuration
     * @returns {Object} Iframe embed code and configuration
     */
    createIframeEmbed(systemId, iframeConfig) {
        const {
            src,
            width = '100%',
            height = '600px',
            sandbox = 'allow-scripts allow-same-origin',
            allowFullscreen = false,
            title = 'Campus Assistant Chatbot'
        } = iframeConfig;

        const chatbotUrl = this.generateChatbotUrl(systemId);
        
        const embedCode = `
<!-- Campus Assistant Chatbot Integration -->
<div id="campus-assistant-container" style="width: ${width}; height: ${height};">
    <iframe 
        id="campus-assistant-iframe"
        src="${chatbotUrl}"
        width="100%" 
        height="100%"
        frameborder="0"
        sandbox="${sandbox}"
        title="${title}"
        ${allowFullscreen ? 'allowfullscreen' : ''}
        style="border: 1px solid #e5e7eb; border-radius: 8px;">
    </iframe>
</div>

<script>
// Campus Assistant Communication Bridge
(function() {
    const iframe = document.getElementById('campus-assistant-iframe');
    const container = document.getElementById('campus-assistant-container');
    
    // Listen for messages from chatbot
    window.addEventListener('message', function(event) {
        if (event.origin !== '${new URL(chatbotUrl).origin}') return;
        
        switch(event.data.type) {
            case 'resize':
                if (event.data.height) {
                    iframe.style.height = event.data.height + 'px';
                }
                break;
            case 'navigate':
                if (event.data.url) {
                    window.location.href = event.data.url;
                }
                break;
            case 'query_erp':
                // Forward query to parent ERP system
                handleERPQuery(event.data.query);
                break;
        }
    });
    
    // Send initial configuration to chatbot
    iframe.onload = function() {
        iframe.contentWindow.postMessage({
            type: 'init',
            systemId: '${systemId}',
            config: ${JSON.stringify(iframeConfig)}
        }, '*');
    };
    
    // Handle ERP queries from chatbot
    function handleERPQuery(query) {
        // This function should be implemented by the host ERP system
        if (window.handleCampusAssistantQuery) {
            window.handleCampusAssistantQuery(query);
        }
    }
})();
</script>
`;

        return {
            embedCode,
            chatbotUrl,
            systemId,
            configuration: iframeConfig
        };
    }

    /**
     * Generate chatbot URL for specific ERP system
     * @param {string} systemId - ERP system identifier
     * @returns {string} Customized chatbot URL
     */
    generateChatbotUrl(systemId) {
        const baseUrl = window.location.origin;
        const params = new URLSearchParams({
            system: systemId,
            embed: 'true',
            theme: 'auto'
        });
        
        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * Connect to an ERP system
     * @param {string} systemId - ERP system identifier
     * @returns {Promise<boolean>} Connection success
     */
    async connectToERP(systemId) {
        const integration = this.integrations.get(systemId);
        if (!integration) {
            throw new Error(`ERP integration not found: ${systemId}`);
        }

        try {
            switch (integration.type) {
                case 'generic_rest':
                    return await this.connectREST(integration);
                case 'iframe_embed':
                    return await this.setupIframeComm(integration);
                case 'websocket':
                    return await this.connectWebSocket(integration);
                case 'csv_import':
                    return await this.setupCSVImport(integration);
                default:
                    throw new Error(`Unsupported integration type: ${integration.type}`);
            }
        } catch (error) {
            console.error(`Failed to connect to ERP ${systemId}:`, error);
            integration.status = 'error';
            integration.lastError = error.message;
            return false;
        }
    }

    /**
     * Connect to REST API based ERP
     * @param {Object} integration - Integration configuration
     * @returns {Promise<boolean>} Connection success
     */
    async connectREST(integration) {
        const { endpoint, authMethod, credentials } = integration;
        
        try {
            const headers = await this.getAuthHeaders(integration.id, authMethod, credentials);
            
            const response = await fetch(`${endpoint}/api/health`, {
                method: 'GET',
                headers
            });

            if (response.ok) {
                integration.status = 'active';
                integration.lastSync = new Date().toISOString();
                this.activeConnections.add(integration.id);
                
                // Start polling if enabled
                if (integration.polling.enabled) {
                    this.startPolling(integration.id);
                }
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            throw new Error(`REST connection failed: ${error.message}`);
        }
    }

    /**
     * Setup iframe communication
     * @param {Object} integration - Integration configuration
     * @returns {Promise<boolean>} Setup success
     */
    async setupIframeComm(integration) {
        // Setup postMessage communication for iframe
        window.addEventListener('message', (event) => {
            if (event.data.systemId === integration.id) {
                this.handleIframeMessage(integration.id, event.data);
            }
        });

        integration.status = 'active';
        this.activeConnections.add(integration.id);
        return true;
    }

    /**
     * Connect via WebSocket
     * @param {Object} integration - Integration configuration
     * @returns {Promise<boolean>} Connection success
     */
    async connectWebSocket(integration) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(integration.endpoint);
            
            ws.onopen = () => {
                integration.status = 'active';
                integration.websocket = ws;
                this.activeConnections.add(integration.id);
                resolve(true);
            };
            
            ws.onerror = (error) => {
                reject(new Error(`WebSocket connection failed: ${error.message}`));
            };
            
            ws.onmessage = (event) => {
                this.handleWebSocketMessage(integration.id, event.data);
            };
        });
    }

    /**
     * Setup CSV import mechanism
     * @param {Object} integration - Integration configuration
     * @returns {Promise<boolean>} Setup success
     */
    async setupCSVImport(integration) {
        // CSV import is passive - mark as ready
        integration.status = 'active';
        this.activeConnections.add(integration.id);
        return true;
    }

    /**
     * Get authentication headers for API calls
     * @param {string} systemId - ERP system identifier
     * @param {string} authMethod - Authentication method
     * @param {Object} credentials - Authentication credentials
     * @returns {Promise<Object>} Headers object
     */
    async getAuthHeaders(systemId, authMethod, credentials) {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Campus-Assistant/1.0'
        };

        switch (authMethod) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${credentials.token}`;
                break;
            case 'api_key':
                headers[credentials.headerName || 'X-API-Key'] = credentials.apiKey;
                break;
            case 'basic':
                const auth = btoa(`${credentials.username}:${credentials.password}`);
                headers['Authorization'] = `Basic ${auth}`;
                break;
            case 'custom':
                if (this.authHandlers.has(systemId)) {
                    const customHeaders = await this.authHandlers.get(systemId)(credentials);
                    Object.assign(headers, customHeaders);
                }
                break;
        }

        return headers;
    }

    /**
     * Query ERP system for data
     * @param {string} systemId - ERP system identifier
     * @param {string} queryType - Type of query (students, fees, schedules, etc.)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Query results
     */
    async queryERP(systemId, queryType, params = {}) {
        const integration = this.integrations.get(systemId);
        if (!integration || integration.status !== 'active') {
            throw new Error(`ERP system not available: ${systemId}`);
        }

        switch (integration.type) {
            case 'generic_rest':
                return await this.queryREST(integration, queryType, params);
            case 'websocket':
                return await this.queryWebSocket(integration, queryType, params);
            case 'iframe_embed':
                return await this.queryIframe(integration, queryType, params);
            default:
                throw new Error(`Query not supported for type: ${integration.type}`);
        }
    }

    /**
     * Query REST API
     * @param {Object} integration - Integration configuration
     * @param {string} queryType - Query type
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} API response
     */
    async queryREST(integration, queryType, params) {
        const headers = await this.getAuthHeaders(
            integration.id, 
            integration.authMethod, 
            integration.credentials
        );

        const url = new URL(`${integration.endpoint}/api/${queryType}`);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`API query failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform data if transformer is available
        if (this.dataTransformers.has(integration.id)) {
            return this.dataTransformers.get(integration.id)(data, queryType);
        }

        return data;
    }

    /**
     * Send data to ERP system
     * @param {string} systemId - ERP system identifier
     * @param {string} dataType - Type of data to send
     * @param {Object} data - Data to send
     * @returns {Promise<Object>} Send result
     */
    async sendToERP(systemId, dataType, data) {
        const integration = this.integrations.get(systemId);
        if (!integration || integration.status !== 'active') {
            throw new Error(`ERP system not available: ${systemId}`);
        }

        switch (integration.type) {
            case 'generic_rest':
                return await this.sendREST(integration, dataType, data);
            case 'websocket':
                return await this.sendWebSocket(integration, dataType, data);
            case 'iframe_embed':
                return await this.sendIframe(integration, dataType, data);
            default:
                throw new Error(`Send not supported for type: ${integration.type}`);
        }
    }

    /**
     * Handle iframe messages
     * @param {string} systemId - ERP system identifier
     * @param {Object} data - Message data
     */
    handleIframeMessage(systemId, data) {
        console.log(`Received iframe message from ${systemId}:`, data);
        
        // Handle different message types
        switch (data.type) {
            case 'query_response':
                this.processQueryResponse(systemId, data);
                break;
            case 'user_action':
                this.processUserAction(systemId, data);
                break;
            case 'error':
                this.processError(systemId, data);
                break;
        }
    }

    /**
     * Start polling for updates
     * @param {string} systemId - ERP system identifier
     */
    startPolling(systemId) {
        const integration = this.integrations.get(systemId);
        if (!integration || !integration.polling.enabled) return;

        const pollInterval = setInterval(async () => {
            try {
                if (integration.status === 'active') {
                    await this.pollForUpdates(systemId);
                } else {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error(`Polling error for ${systemId}:`, error);
            }
        }, integration.polling.interval);

        integration.pollInterval = pollInterval;
    }

    /**
     * Poll for updates from ERP system
     * @param {string} systemId - ERP system identifier
     */
    async pollForUpdates(systemId) {
        try {
            const updates = await this.queryERP(systemId, 'updates', {
                since: this.integrations.get(systemId).lastSync
            });
            
            if (updates && updates.length > 0) {
                this.processUpdates(systemId, updates);
                this.integrations.get(systemId).lastSync = new Date().toISOString();
            }
        } catch (error) {
            console.error(`Failed to poll updates for ${systemId}:`, error);
        }
    }

    /**
     * Process updates from ERP system
     * @param {string} systemId - ERP system identifier
     * @param {Array} updates - Update data
     */
    processUpdates(systemId, updates) {
        // Emit custom event for other components to handle
        window.dispatchEvent(new CustomEvent('erpUpdates', {
            detail: { systemId, updates }
        }));
    }

    /**
     * Disconnect from ERP system
     * @param {string} systemId - ERP system identifier
     */
    disconnectFromERP(systemId) {
        const integration = this.integrations.get(systemId);
        if (!integration) return;

        // Clean up connections
        if (integration.websocket) {
            integration.websocket.close();
        }

        if (integration.pollInterval) {
            clearInterval(integration.pollInterval);
        }

        integration.status = 'inactive';
        this.activeConnections.delete(systemId);
        
        console.log(`Disconnected from ERP: ${systemId}`);
    }

    /**
     * Get integration status
     * @param {string} systemId - ERP system identifier
     * @returns {Object} Status information
     */
    getIntegrationStatus(systemId) {
        const integration = this.integrations.get(systemId);
        if (!integration) {
            return { status: 'not_found' };
        }

        return {
            id: integration.id,
            type: integration.type,
            status: integration.status,
            lastSync: integration.lastSync,
            lastError: integration.lastError,
            isActive: this.activeConnections.has(systemId)
        };
    }

    /**
     * List all integrations
     * @returns {Array} List of integration statuses
     */
    listIntegrations() {
        return Array.from(this.integrations.keys()).map(systemId => 
            this.getIntegrationStatus(systemId)
        );
    }

    /**
     * Import ERP data from file
     * @param {File} file - Data file (CSV, JSON, XML)
     * @param {string} systemId - ERP system identifier
     * @returns {Promise<Object>} Import result
     */
    async importERPData(file, systemId) {
        const fileType = file.name.split('.').pop().toLowerCase();
        let data;

        try {
            switch (fileType) {
                case 'csv':
                    data = await this.parseCSV(file);
                    break;
                case 'json':
                    data = JSON.parse(await file.text());
                    break;
                case 'xml':
                    data = await this.parseXML(file);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }

            // Process imported data
            const processed = await this.processImportedData(systemId, data);
            
            return {
                success: true,
                recordsProcessed: processed.length,
                systemId,
                importedAt: new Date().toISOString()
            };
            
        } catch (error) {
            throw new Error(`Data import failed: ${error.message}`);
        }
    }

    /**
     * Parse CSV file
     * @param {File} file - CSV file
     * @returns {Promise<Array>} Parsed data
     */
    async parseCSV(file) {
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const record = {};
            headers.forEach((header, index) => {
                record[header] = values[index] || '';
            });
            return record;
        });
    }

    /**
     * Process imported data
     * @param {string} systemId - ERP system identifier
     * @param {Array} data - Raw imported data
     * @returns {Promise<Array>} Processed data
     */
    async processImportedData(systemId, data) {
        // Transform data if transformer is available
        if (this.dataTransformers.has(systemId)) {
            data = this.dataTransformers.get(systemId)(data, 'import');
        }

        // Store processed data (in production, you'd save to database)
        const integration = this.integrations.get(systemId);
        if (!integration.importedData) {
            integration.importedData = [];
        }
        
        integration.importedData.push({
            data,
            importedAt: new Date().toISOString()
        });

        return data;
    }
}

export default ERPIntegrationFramework;