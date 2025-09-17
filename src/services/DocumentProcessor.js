/**
 * Document Processing Pipeline for Multilingual Campus Chatbot
 * Converts PDF/Word documents into searchable multilingual knowledge base
 * Supports OCR, content extraction, and multilingual indexing
 */

import * as pdfjsLib from 'pdfjs-dist';

export class DocumentProcessor {
    constructor() {
        this.supportedFormats = ['pdf', 'docx', 'txt', 'doc'];
        this.extractedKnowledge = new Map();
        this.multilingualIndex = new Map();
        this.initializePDFWorker();
    }

    initializePDFWorker() {
        // Configure PDF.js worker for better performance
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    /**
     * Main document ingestion method
     * @param {File} file - Document file to process
     * @param {Object} metadata - Additional metadata about the document
     * @returns {Promise<Object>} Processed knowledge structure
     */
    async ingestDocument(file, metadata = {}) {
        try {
            console.log(`Processing document: ${file.name}`);
            
            // Validate file format
            if (!this.isValidFormat(file)) {
                throw new Error(`Unsupported file format: ${file.name}`);
            }

            // Extract content based on file type
            const content = await this.extractContent(file);
            
            // Process and structure the content
            const processedData = await this.processContent(content, metadata);
            
            // Store in knowledge base
            const knowledgeId = this.storeKnowledge(processedData);
            
            // Create multilingual index
            await this.createMultilingualIndex(processedData, knowledgeId);
            
            return {
                success: true,
                knowledgeId,
                contentLength: content.length,
                sectionsExtracted: processedData.sections.length,
                faqsExtracted: processedData.faqs.length,
                metadata: processedData.metadata
            };
            
        } catch (error) {
            console.error('Document processing failed:', error);
            throw new Error(`Failed to process document: ${error.message}`);
        }
    }

    /**
     * Validate if file format is supported
     * @param {File} file - File to validate
     * @returns {boolean} Whether format is supported
     */
    isValidFormat(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return this.supportedFormats.includes(extension);
    }

    /**
     * Extract content from different file types
     * @param {File} file - File to extract content from
     * @returns {Promise<string>} Extracted text content
     */
    async extractContent(file) {
        const fileType = file.name.split('.').pop().toLowerCase();
        
        switch (fileType) {
            case 'pdf':
                return await this.extractPDFContent(file);
            case 'docx':
                return await this.extractDocxContent(file);
            case 'doc':
                return await this.extractDocContent(file);
            case 'txt':
                return await file.text();
            default:
                throw new Error(`Unsupported file format: ${fileType}`);
        }
    }

    /**
     * Extract content from PDF files using PDF.js
     * @param {File} file - PDF file
     * @returns {Promise<string>} Extracted text
     */
    async extractPDFContent(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            
            fullText += `\n--- Page ${i} ---\n${pageText}\n`;
        }
        
        return fullText;
    }

    /**
     * Extract content from DOCX files
     * @param {File} file - DOCX file
     * @returns {Promise<string>} Extracted text
     */
    async extractDocxContent(file) {
        // For production, you would use a library like mammoth.js
        // This is a simplified implementation
        try {
            const text = await file.text();
            // Basic extraction - in production, use proper DOCX parser
            return text.replace(/<[^>]*>/g, ''); // Remove XML tags
        } catch (error) {
            throw new Error('Failed to extract DOCX content. Please convert to PDF or TXT format.');
        }
    }

    /**
     * Extract content from DOC files
     * @param {File} file - DOC file
     * @returns {Promise<string>} Extracted text
     */
    async extractDocContent(file) {
        throw new Error('DOC format not supported. Please convert to DOCX, PDF, or TXT format.');
    }

    /**
     * Process extracted content into structured knowledge
     * @param {string} content - Raw extracted text
     * @param {Object} metadata - Document metadata
     * @returns {Object} Structured knowledge object
     */
    async processContent(content, metadata) {
        const sections = this.extractSections(content);
        const faqs = this.extractFAQs(content);
        const entities = this.extractEntities(content);
        const keyTopics = this.extractKeyTopics(content);
        
        return {
            originalContent: content,
            sections,
            faqs,
            entities,
            keyTopics,
            metadata: {
                ...metadata,
                processedAt: new Date().toISOString(),
                contentLength: content.length,
                language: this.detectPrimaryLanguage(content)
            }
        };
    }

    /**
     * Extract sections from document content
     * @param {string} content - Document content
     * @returns {Array} Extracted sections
     */
    extractSections(content) {
        const sections = [];
        
        // Split by common section headers
        const sectionPatterns = [
            /(?:^|\n)\s*(?:CHAPTER|Chapter|अध्याय|प्रकरण)\s*\d+/g,
            /(?:^|\n)\s*(?:SECTION|Section|भाग|विभाग)\s*\d+/g,
            /(?:^|\n)\s*(?:\d+\.|\d+\))\s*[A-Z][^.]*:/g
        ];
        
        let currentPosition = 0;
        const sectionHeaders = [];
        
        // Find all section headers
        sectionPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                sectionHeaders.push({
                    title: match[0].trim(),
                    position: match.index
                });
            }
        });
        
        // Sort by position
        sectionHeaders.sort((a, b) => a.position - b.position);
        
        // Extract content between headers
        for (let i = 0; i < sectionHeaders.length; i++) {
            const start = sectionHeaders[i].position;
            const end = i < sectionHeaders.length - 1 ? sectionHeaders[i + 1].position : content.length;
            
            sections.push({
                title: sectionHeaders[i].title,
                content: content.substring(start, end).trim(),
                position: start
            });
        }
        
        return sections;
    }

    /**
     * Extract FAQ-style content
     * @param {string} content - Document content
     * @returns {Array} Extracted FAQs
     */
    extractFAQs(content) {
        const faqs = [];
        
        // Common FAQ patterns in multiple languages
        const faqPatterns = [
            /(?:Q:|Question:|प्रश्न:|सवाल:)\s*([^?]*\?)\s*(?:A:|Answer:|उत्तर:|जवाब:)\s*([^Q]*?)(?=Q:|Question:|प्रश्न:|सवाल:|$)/gis,
            /(?:क्या|What|How|कैसे|कब|When|Where|कहाँ|Why|क्यों)([^?]*\?)\s*([^।.]*[।.])/gis
        ];
        
        faqPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                faqs.push({
                    question: match[1].trim(),
                    answer: match[2].trim(),
                    language: this.detectLanguage(match[0])
                });
            }
        });
        
        return faqs;
    }

    /**
     * Extract named entities (fees, dates, contacts, etc.)
     * @param {string} content - Document content
     * @returns {Array} Extracted entities
     */
    extractEntities(content) {
        const entities = [];
        
        // Fee patterns
        const feePatterns = [
            /(?:fee|fees|शुल्क|फीस).*?(?:₹|Rs\.?|INR)\s*(\d+(?:,\d+)*)/gis,
            /(?:₹|Rs\.?|INR)\s*(\d+(?:,\d+)*)/g
        ];
        
        // Date patterns
        const datePatterns = [
            /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
            /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|जन|फर|मार|अप्र|मई|जून|जुल|अग|सित|अक्त|नव|दिस)\w*\s+\d{2,4})/gis
        ];
        
        // Extract fees
        feePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                entities.push({
                    type: 'fee',
                    value: match[1] || match[0],
                    context: content.substring(Math.max(0, match.index - 50), match.index + 50)
                });
            }
        });
        
        // Extract dates
        datePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                entities.push({
                    type: 'date',
                    value: match[1] || match[0],
                    context: content.substring(Math.max(0, match.index - 50), match.index + 50)
                });
            }
        });
        
        return entities;
    }

    /**
     * Extract key topics for better search indexing
     * @param {string} content - Document content
     * @returns {Array} Key topics
     */
    extractKeyTopics(content) {
        // Common campus-related keywords in multiple languages
        const topicKeywords = [
            // English
            'admission', 'fee', 'scholarship', 'timetable', 'exam', 'result', 'hostel', 'library',
            'placement', 'course', 'semester', 'grade', 'certificate', 'transcript',
            // Hindi
            'प्रवेश', 'शुल्क', 'छात्रवृत्ति', 'समय-सारणी', 'परीक्षा', 'परिणाम', 'छात्रावास', 'पुस्तकालय',
            // Marathi
            'प्रवेश', 'फी', 'शिष्यवृत्ती', 'वेळापत्रक', 'परीक्षा', 'निकाल'
        ];
        
        const topics = [];
        const contentLower = content.toLowerCase();
        
        topicKeywords.forEach(keyword => {
            const count = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
            if (count > 0) {
                topics.push({
                    keyword,
                    frequency: count,
                    relevance: count / content.length * 1000 // Normalize by content length
                });
            }
        });
        
        return topics.sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Detect primary language of content
     * @param {string} content - Text content
     * @returns {string} Language code
     */
    detectPrimaryLanguage(content) {
        const patterns = {
            hi: /[\u0900-\u097F]/g,
            mr: /[\u0900-\u097F]/g, // Marathi uses Devanagari like Hindi
            gu: /[\u0A80-\u0AFF]/g,
            bn: /[\u0980-\u09FF]/g,
            ta: /[\u0B80-\u0BFF]/g,
            te: /[\u0C00-\u0C7F]/g,
            kn: /[\u0C80-\u0CFF]/g
        };
        
        let maxMatches = 0;
        let detectedLang = 'en';
        
        Object.entries(patterns).forEach(([lang, pattern]) => {
            const matches = (content.match(pattern) || []).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedLang = lang;
            }
        });
        
        return detectedLang;
    }

    /**
     * Detect language of specific text
     * @param {string} text - Text to analyze
     * @returns {string} Language code
     */
    detectLanguage(text) {
        return this.detectPrimaryLanguage(text);
    }

    /**
     * Store processed knowledge in memory/database
     * @param {Object} processedData - Structured knowledge
     * @returns {string} Knowledge ID
     */
    storeKnowledge(processedData) {
        const knowledgeId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.extractedKnowledge.set(knowledgeId, processedData);
        return knowledgeId;
    }

    /**
     * Create multilingual search index
     * @param {Object} processedData - Processed knowledge
     * @param {string} knowledgeId - Knowledge identifier
     */
    async createMultilingualIndex(processedData, knowledgeId) {
        const { sections, faqs, entities, keyTopics } = processedData;
        
        // Index sections
        sections.forEach((section, index) => {
            this.addToIndex(`${knowledgeId}_section_${index}`, section.content, section.title);
        });
        
        // Index FAQs
        faqs.forEach((faq, index) => {
            this.addToIndex(`${knowledgeId}_faq_${index}`, `${faq.question} ${faq.answer}`, faq.question);
        });
        
        // Index entities
        entities.forEach((entity, index) => {
            this.addToIndex(`${knowledgeId}_entity_${index}`, entity.context, entity.value);
        });
    }

    /**
     * Add content to search index
     * @param {string} id - Content identifier
     * @param {string} content - Content to index
     * @param {string} title - Content title
     */
    addToIndex(id, content, title = '') {
        const words = content.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 2) { // Ignore very short words
                if (!this.multilingualIndex.has(word)) {
                    this.multilingualIndex.set(word, new Set());
                }
                this.multilingualIndex.get(word).add(id);
            }
        });
        
        // Also index title words with higher weight
        if (title) {
            const titleWords = title.toLowerCase().split(/\s+/);
            titleWords.forEach(word => {
                if (word.length > 2) {
                    if (!this.multilingualIndex.has(`title_${word}`)) {
                        this.multilingualIndex.set(`title_${word}`, new Set());
                    }
                    this.multilingualIndex.get(`title_${word}`).add(id);
                }
            });
        }
    }

    /**
     * Search through indexed knowledge
     * @param {string} query - Search query
     * @param {number} limit - Maximum results to return
     * @returns {Array} Search results
     */
    searchKnowledge(query, limit = 10) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const matches = new Map(); // id -> score
        
        queryWords.forEach(word => {
            // Check direct word matches
            if (this.multilingualIndex.has(word)) {
                this.multilingualIndex.get(word).forEach(id => {
                    matches.set(id, (matches.get(id) || 0) + 1);
                });
            }
            
            // Check title matches (higher weight)
            if (this.multilingualIndex.has(`title_${word}`)) {
                this.multilingualIndex.get(`title_${word}`).forEach(id => {
                    matches.set(id, (matches.get(id) || 0) + 3);
                });
            }
        });
        
        // Sort by relevance score
        const results = Array.from(matches.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id, score]) => ({ id, score }));
        
        return results;
    }

    /**
     * Get knowledge by ID
     * @param {string} knowledgeId - Knowledge identifier
     * @returns {Object} Knowledge data
     */
    getKnowledge(knowledgeId) {
        return this.extractedKnowledge.get(knowledgeId);
    }

    /**
     * Get all available knowledge IDs
     * @returns {Array} List of knowledge IDs
     */
    getAvailableKnowledge() {
        return Array.from(this.extractedKnowledge.keys());
    }

    /**
     * Export knowledge base for backup/sharing
     * @returns {Object} Serialized knowledge base
     */
    exportKnowledgeBase() {
        return {
            knowledge: Object.fromEntries(this.extractedKnowledge),
            index: Object.fromEntries(
                Array.from(this.multilingualIndex.entries()).map(([key, set]) => [key, Array.from(set)])
            ),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import knowledge base from backup
     * @param {Object} exportedData - Previously exported knowledge base
     */
    importKnowledgeBase(exportedData) {
        this.extractedKnowledge = new Map(Object.entries(exportedData.knowledge));
        this.multilingualIndex = new Map(
            Object.entries(exportedData.index).map(([key, array]) => [key, new Set(array)])
        );
    }
}

export default DocumentProcessor;