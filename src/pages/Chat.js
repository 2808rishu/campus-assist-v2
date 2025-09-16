import React, { useState, useRef, useEffect, useCallback } from "react";
import { Conversation, ChatSession } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Loader2, PhoneCall, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MessageBubble from "../components/chat/MessageBubble";
import LanguageSelector from "../components/chat/LanguageSelector";
import QuickActions from "../components/chat/QuickActions";

const languageNames = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada"
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = useCallback(async () => {
    await ChatSession.create({
      session_id: sessionId,
      preferred_language: selectedLanguage,
      user_ip: "127.0.0.1", // In real app, get from server
      user_agent: navigator.userAgent
    });
  }, [sessionId, selectedLanguage]);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage = selectedLanguage === 'hi'
      ? "नमस्ते! मैं आपका कैंपस असिस्टेंट हूं। मैं फीस, छात्रवृत्ति, समय सारणी और अन्य कॉलेज की जानकारी में आपकी मदद कर सकता हूं। आप मुझसे हिंदी या अंग्रेजी में बात कर सकते हैं!"
      : "Hello! I'm your campus assistant. I can help you with fees, scholarships, timetables, and other college information. You can talk to me in Hindi or English!";

    setMessages([{
      id: 1,
      text: welcomeMessage,
      isBot: true,
      timestamp: new Date(),
      language: selectedLanguage,
      confidence: 1.0
    }]);
  }, [selectedLanguage, setMessages]); // Added setMessages as a dependency

  useEffect(() => {
    initializeSession();
    addWelcomeMessage();
  }, [initializeSession, addWelcomeMessage]); // Added memoized functions to dependencies

  const detectLanguage = (text) => {
    // Simple language detection - in production use proper language detection
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(text) ? 'hi' : 'en';
  };

  const handleSendMessage = async (message = inputMessage, category = "general") => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setShowQuickActions(false);
    setError(null);

    try {
      const detectedInputLanguage = detectLanguage(message); // For logging
      const outputLanguage = selectedLanguage; // Use user's selection for output
      const outputLanguageName = languageNames[outputLanguage];

      const startTime = Date.now();

      // Create a more explicit prompt for the LLM
      const prompt = `You are a helpful campus assistant for a university.
Your task is to answer the user's question accurately.
**CRITICAL INSTRUCTION: You MUST respond in the ${outputLanguageName} language.**

User's question: "${message}"
Category of question: ${category}

Your response should be helpful and conversational, providing information about fees, scholarships, timetables, admissions, exams, and general college policies.
If you don't know the answer, politely state that you don't have the information and suggest contacting the relevant college office.

Again, it is absolutely essential that your entire response is in ${outputLanguageName}. Do not use any other language.`;

      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const responseTime = Date.now() - startTime;
      const confidence = 0.85; // Mock confidence score

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date(),
        language: outputLanguage, // Use selectedLanguage for bot's response
        confidence: confidence
      };

      setMessages(prev => [...prev, botMessage]);

      // Log the conversation
      await Conversation.create({
        session_id: sessionId,
        user_message: message,
        bot_response: response,
        detected_language: detectedInputLanguage, // Log language detected in input
        intent_category: category,
        confidence_score: confidence,
        response_time_ms: responseTime
      });

    } catch (error) {
      console.error("Error generating response:", error);
      setError("Sorry, I'm having trouble responding right now. Please try again or contact support.");

      const errorMessage = {
        id: Date.now() + 1,
        text: selectedLanguage === 'hi'
          ? "क्षमा करें, मुझे अभी उत्तर देने में समस्या हो रही है। कृपया फिर से कोशिश करें या सहायता से संपर्क करें।"
          : "Sorry, I'm having trouble responding right now. Please try again or contact support.",
        isBot: true,
        timestamp: new Date(),
        language: selectedLanguage,
        confidence: 0.0
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateMessage = async (messageId, rating) => {
    // In a real app, update the conversation record with the rating
    console.log(`Rated message ${messageId} with ${rating} stars`);
  };

  const handleEscalateToHuman = () => {
    const escalationMessage = {
      id: Date.now(),
      text: selectedLanguage === 'hi'
        ? "मैं आपको मानव सहायक से जोड़ रहा हूं। कृपया प्रतीक्षा करें या कॉलेज कार्यालय से सीधे संपर्क करें: +91-XXX-XXXXXXX"
        : "I'm connecting you to a human assistant. Please wait or contact the college office directly at: +91-XXX-XXXXXXX",
      isBot: true,
      timestamp: new Date(),
      language: selectedLanguage,
      confidence: 1.0
    };

    setMessages(prev => [...prev, escalationMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200/50 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campus Assistant</h1>
                <p className="text-sm text-gray-600">
                  {selectedLanguage === 'hi' ? 'आपका बहुभाषी सहायक' : 'Your multilingual helper'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEscalateToHuman}
                  className="flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  {selectedLanguage === 'hi' ? 'मानव सहायता' : 'Human Help'}
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.text}
                  isBot={message.isBot}
                  timestamp={message.timestamp}
                  language={message.language}
                  confidence={message.confidence}
                  onRate={(rating) => handleRateMessage(message.id, rating)}
                />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-blue-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {selectedLanguage === 'hi' ? 'जवाब तैयार कर रहे हैं...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && messages.length <= 1 && (
            <div className="p-4">
              <QuickActions
                onActionClick={handleSendMessage}
                language={selectedLanguage}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-blue-200/50 p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedLanguage === 'hi'
                      ? "अपना प्रश्न यहाँ टाइप करें..."
                      : "Type your question here..."
                  }
                  disabled={isLoading}
                  className="pr-12 border-gray-200 focus:border-blue-300"
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {selectedLanguage === 'hi'
                ? 'आप हिंदी या अंग्रेजी में प्रश्न पूछ सकते हैं'
                : 'You can ask questions in Hindi or English'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}