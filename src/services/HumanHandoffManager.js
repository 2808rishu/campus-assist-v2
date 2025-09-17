/**
 * Human Handoff Protocols for Complex Queries
 * Handles escalation from chatbot to human support agents
 * Includes queue management, context preservation, and multi-language support
 */

export class HumanHandoffManager {
    constructor() {
        this.handoffQueue = new Map();
        this.supportAgents = new Map();
        this.escalationRules = new Map();
        this.conversationLogger = new ConversationLogger();
        this.initializeHandoffSystem();
    }

    /**
     * Initialize the human handoff system
     */
    initializeHandoffSystem() {
        this.setupEscalationRules();
        this.initializeWebSocketConnection();
        this.setupUIComponents();
    }

    /**
     * Setup escalation rules for different query types
     */
    setupEscalationRules() {
        // Complex financial queries
        this.escalationRules.set('complex_financial', {
            triggers: ['loan', 'EMI', 'refund', 'scholarship eligibility', 'financial aid calculation'],
            priority: 'high',
            department: 'finance',
            estimatedWaitTime: 300 // 5 minutes
        });

        // Technical issues
        this.escalationRules.set('technical_issues', {
            triggers: ['portal not working', 'login failed', 'payment error', 'technical problem'],
            priority: 'urgent',
            department: 'IT',
            estimatedWaitTime: 180 // 3 minutes
        });

        // Academic matters
        this.escalationRules.set('academic_complex', {
            triggers: ['course change', 'credit transfer', 'grade appeal', 'academic calendar'],
            priority: 'medium',
            department: 'academic',
            estimatedWaitTime: 600 // 10 minutes
        });

        // Admission issues
        this.escalationRules.set('admission_complex', {
            triggers: ['document verification', 'eligibility query', 'admission appeal'],
            priority: 'high',
            department: 'admissions',
            estimatedWaitTime: 450 // 7.5 minutes
        });

        // General complaints
        this.escalationRules.set('complaints', {
            triggers: ['complaint', 'unsatisfied', 'problem with', 'issue with'],
            priority: 'medium',
            department: 'admin',
            estimatedWaitTime: 720 // 12 minutes
        });
    }

    /**
     * Analyze message for escalation triggers
     * @param {string} message - User message
     * @param {Object} context - Conversation context
     * @returns {Object} Escalation recommendation
     */
    analyzeEscalationNeed(message, context) {
        const messageLower = message.toLowerCase();
        const escalationSignals = {
            complexity: 0,
            frustration: 0,
            specificity: 0,
            urgency: 0
        };

        // Check for complexity indicators
        const complexityTriggers = [
            'multiple', 'various', 'different', 'complex', 'complicated',
            'several', 'many', 'numerous', 'detailed', 'specific'
        ];
        
        complexityTriggers.forEach(trigger => {
            if (messageLower.includes(trigger)) {
                escalationSignals.complexity += 1;
            }
        });

        // Check for frustration indicators
        const frustrationTriggers = [
            'frustrated', 'annoyed', 'angry', 'upset', 'disappointed',
            'not working', 'doesn\\'t work', 'problem', 'issue', 'error',
            'help me', 'urgent', 'immediately', 'asap'
        ];
        
        frustrationTriggers.forEach(trigger => {
            if (messageLower.includes(trigger)) {
                escalationSignals.frustration += 1;
            }
        });

        // Check conversation history for repeated queries
        if (context && context.length > 3) {
            const recentMessages = context.slice(-3);
            const similarQueries = recentMessages.filter(msg => 
                this.calculateSimilarity(msg.message, message) > 0.7
            );
            
            if (similarQueries.length >= 2) {
                escalationSignals.frustration += 2;
            }
        }

        // Check for specific escalation rules
        let matchedRule = null;
        for (const [ruleName, rule] of this.escalationRules) {
            const hasMatch = rule.triggers.some(trigger => 
                messageLower.includes(trigger.toLowerCase())
            );
            
            if (hasMatch) {
                matchedRule = { name: ruleName, ...rule };
                break;
            }
        }

        // Calculate overall escalation score
        const totalScore = 
            escalationSignals.complexity * 0.3 +
            escalationSignals.frustration * 0.4 +
            escalationSignals.specificity * 0.2 +
            escalationSignals.urgency * 0.1;

        const shouldEscalate = totalScore >= 2 || matchedRule;

        return {
            shouldEscalate,
            confidence: Math.min(totalScore / 5, 1),
            matchedRule,
            signals: escalationSignals,
            recommendation: this.getEscalationRecommendation(totalScore, matchedRule)
        };
    }

    /**
     * Get escalation recommendation
     */
    getEscalationRecommendation(score, matchedRule) {
        if (matchedRule) {
            return {
                priority: matchedRule.priority,
                department: matchedRule.department,
                estimatedWaitTime: matchedRule.estimatedWaitTime,
                reason: `Matched rule: ${matchedRule.name}`
            };
        }

        if (score >= 4) {
            return {
                priority: 'urgent',
                department: 'general',
                estimatedWaitTime: 180,
                reason: 'High complexity/frustration detected'
            };
        } else if (score >= 2) {
            return {
                priority: 'medium',
                department: 'general',
                estimatedWaitTime: 600,
                reason: 'Moderate escalation signals'
            };
        }

        return null;
    }

    /**
     * Calculate similarity between two messages
     */
    calculateSimilarity(msg1, msg2) {
        const words1 = msg1.toLowerCase().split(/\\s+/);
        const words2 = msg2.toLowerCase().split(/\\s+/);
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return intersection.length / union.length;
    }

    /**
     * Initiate handoff to human agent
     * @param {string} userId - User identifier
     * @param {Object} context - Full conversation context
     * @param {Object} escalationInfo - Escalation details
     * @returns {Promise<Object>} Handoff result
     */
    async initiateHandoff(userId, context, escalationInfo) {
        const handoffId = this.generateHandoffId();
        const timestamp = new Date().toISOString();
        
        const handoffRequest = {
            id: handoffId,
            userId,
            timestamp,
            context,
            escalationInfo,
            status: 'pending',
            queuePosition: this.calculateQueuePosition(escalationInfo.recommendation?.priority),
            estimatedWaitTime: escalationInfo.recommendation?.estimatedWaitTime || 600,
            department: escalationInfo.recommendation?.department || 'general',
            language: context[context.length - 1]?.language || 'en'
        };

        // Add to handoff queue
        this.handoffQueue.set(handoffId, handoffRequest);

        // Log the handoff request
        await this.conversationLogger.logHandoffRequest(handoffRequest);

        // Notify available agents
        this.notifyAgents(handoffRequest);

        // Send confirmation to user
        const confirmationMessage = this.generateHandoffConfirmation(handoffRequest);
        
        return {
            success: true,
            handoffId,
            queuePosition: handoffRequest.queuePosition,
            estimatedWaitTime: handoffRequest.estimatedWaitTime,
            confirmationMessage
        };
    }

    /**
     * Generate handoff confirmation message
     */
    generateHandoffConfirmation(handoffRequest) {
        const messages = {
            en: `You've been connected to our support queue. **Queue position**: ${handoffRequest.queuePosition}. **Estimated wait time**: ${Math.ceil(handoffRequest.estimatedWaitTime / 60)} minutes. A human agent will assist you shortly. Your reference number is **${handoffRequest.id}**.`,
            hi: `आपको हमारी सपोर्ट क्यू से जोड़ दिया गया है। **क्यू में स्थिति**: ${handoffRequest.queuePosition}। **अनुमानित प्रतीक्षा समय**: ${Math.ceil(handoffRequest.estimatedWaitTime / 60)} मिनट। एक मानव एजेंट जल्द ही आपकी सहायता करेगा। आपका संदर्भ नंबर **${handoffRequest.id}** है।`,
            mr: `तुम्हाला आमच्या सपोर्ट रांगेत जोडले गेले आहे। **रांगेतील स्थिती**: ${handoffRequest.queuePosition}। **अंदाजे प्रतीक्षा वेळ**: ${Math.ceil(handoffRequest.estimatedWaitTime / 60)} मिनिटे। एक मानवी एजेंट लवकरच तुमची मदत करेल। तुमचा संदर्भ क्रमांक **${handoffRequest.id}** आहे।`
        };

        return messages[handoffRequest.language] || messages.en;
    }

    /**
     * Calculate queue position based on priority
     */
    calculateQueuePosition(priority) {
        const queueArray = Array.from(this.handoffQueue.values())
            .filter(req => req.status === 'pending')
            .sort((a, b) => {
                const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
                return priorityOrder[b.escalationInfo?.recommendation?.priority || 'low'] - 
                       priorityOrder[a.escalationInfo?.recommendation?.priority || 'low'];
            });
        
        return queueArray.length + 1;
    }

    /**
     * Generate unique handoff ID
     */
    generateHandoffId() {
        return `HO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize WebSocket connection for real-time agent communication
     */
    initializeWebSocketConnection() {
        // In production, this would connect to your backend WebSocket server
        console.log('WebSocket connection initialized for agent communication');
    }

    /**
     * Notify available agents about new handoff request
     */
    notifyAgents(handoffRequest) {
        // In production, this would send notifications to available agents
        console.log('Notifying agents about handoff request:', handoffRequest.id);
    }

    /**
     * Setup UI components for handoff
     */
    setupUIComponents() {
        // Add handoff status indicator to chat interface
        this.createHandoffStatusUI();
    }

    /**
     * Create handoff status UI component
     */
    createHandoffStatusUI() {
        const statusContainer = document.createElement('div');
        statusContainer.id = 'handoff-status';
        statusContainer.style.cssText = `
            display: none;
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(statusContainer);
    }

    /**
     * Show handoff status to user
     */
    showHandoffStatus(handoffInfo) {
        const statusContainer = document.getElementById('handoff-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 8px;\">
                    <div style=\"width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; animation: pulse 2s infinite;\"></div>
                    <strong>Connecting to Human Agent</strong>
                </div>
                <div style=\"font-size: 12px; opacity: 0.8;\">
                    Queue Position: ${handoffInfo.queuePosition}<br>
                    Est. Wait: ${Math.ceil(handoffInfo.estimatedWaitTime / 60)} min<br>
                    Reference: ${handoffInfo.handoffId}
                </div>
            `;
            statusContainer.style.display = 'block';
        }
    }

    /**
     * Hide handoff status
     */
    hideHandoffStatus() {
        const statusContainer = document.getElementById('handoff-status');
        if (statusContainer) {
            statusContainer.style.display = 'none';
        }
    }

    /**
     * Get handoff queue status
     */
    getQueueStatus() {
        const pendingRequests = Array.from(this.handoffQueue.values())
            .filter(req => req.status === 'pending');
        
        return {
            totalInQueue: pendingRequests.length,
            averageWaitTime: this.calculateAverageWaitTime(),
            departmentBreakdown: this.getDepartmentBreakdown(pendingRequests)
        };
    }

    /**
     * Calculate average wait time
     */
    calculateAverageWaitTime() {
        const pendingRequests = Array.from(this.handoffQueue.values())
            .filter(req => req.status === 'pending');
        
        if (pendingRequests.length === 0) return 0;
        
        const totalWaitTime = pendingRequests.reduce((sum, req) => sum + req.estimatedWaitTime, 0);
        return Math.ceil(totalWaitTime / pendingRequests.length / 60); // in minutes
    }

    /**
     * Get department breakdown
     */
    getDepartmentBreakdown(requests) {
        const breakdown = {};
        requests.forEach(req => {
            const dept = req.department || 'general';
            breakdown[dept] = (breakdown[dept] || 0) + 1;
        });
        return breakdown;
    }
}

/**
 * Conversation Logger for Analytics and Context Preservation
 */
class ConversationLogger {
    constructor() {
        this.conversations = new Map();
        this.analyticsData = {
            totalConversations: 0,
            languageDistribution: {},
            intentDistribution: {},
            handoffRate: 0,
            satisfactionScores: [],
            commonIssues: new Map()
        };
    }

    /**
     * Log conversation message
     */
    logMessage(userId, message, metadata = {}) {
        if (!this.conversations.has(userId)) {
            this.conversations.set(userId, {
                id: userId,
                startTime: new Date().toISOString(),
                messages: [],
                language: metadata.language || 'en',
                resolved: false
            });
            this.analyticsData.totalConversations++;
        }

        const conversation = this.conversations.get(userId);
        conversation.messages.push({
            timestamp: new Date().toISOString(),
            message,
            ...metadata
        });

        // Update analytics
        this.updateAnalytics(metadata);
    }

    /**
     * Log handoff request
     */
    async logHandoffRequest(handoffRequest) {
        console.log('Logging handoff request:', handoffRequest.id);
        
        // Update handoff rate
        this.analyticsData.handoffRate = 
            (this.analyticsData.handoffRate * (this.analyticsData.totalConversations - 1) + 1) / 
            this.analyticsData.totalConversations;
    }

    /**
     * Update analytics data
     */
    updateAnalytics(metadata) {
        if (metadata.language) {
            this.analyticsData.languageDistribution[metadata.language] = 
                (this.analyticsData.languageDistribution[metadata.language] || 0) + 1;
        }

        if (metadata.intent) {
            this.analyticsData.intentDistribution[metadata.intent] = 
                (this.analyticsData.intentDistribution[metadata.intent] || 0) + 1;
        }
    }

    /**
     * Get analytics report
     */
    getAnalyticsReport() {
        return {
            ...this.analyticsData,
            averageConversationLength: this.calculateAverageConversationLength(),
            topLanguages: this.getTopLanguages(),
            topIntents: this.getTopIntents(),
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Calculate average conversation length
     */
    calculateAverageConversationLength() {
        const conversations = Array.from(this.conversations.values());
        if (conversations.length === 0) return 0;
        
        const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
        return Math.round(totalMessages / conversations.length);
    }

    /**
     * Get top languages
     */
    getTopLanguages() {
        return Object.entries(this.analyticsData.languageDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    /**
     * Get top intents
     */
    getTopIntents() {
        return Object.entries(this.analyticsData.intentDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }
}

export default HumanHandoffManager;