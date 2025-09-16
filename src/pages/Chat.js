import React, { useState, useRef, useEffect } from "react";
import { Send, PhoneCall, Globe, Bot, User, MessageCircle, Clock, CreditCard, GraduationCap, FileText, Calendar, HelpCircle, Volume2, Copy, ThumbsUp, ThumbsDown, Menu, Home, BarChart3, Settings, UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Multilingual support for 8 Indian languages as per SIH requirements
const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" }
];

// Quick actions for common campus queries as per SIH requirements
const quickActions = [
  { icon: CreditCard, label: "Fee Information", query: "Tell me about fee structure and payment deadlines", labelHi: "फीस की जानकारी" },
  { icon: GraduationCap, label: "Scholarships", query: "What scholarships are available for students?", labelHi: "छात्रवृत्ति" },
  { icon: Calendar, label: "Timetable", query: "Show me the current class timetable and schedule", labelHi: "समय सारणी" },
  { icon: FileText, label: "Admissions", query: "How do I apply for admission? What are the requirements?", labelHi: "प्रवेश" },
  { icon: Clock, label: "Exam Schedule", query: "When are the upcoming exams and results?", labelHi: "परीक्षा समय" },
  { icon: HelpCircle, label: "General Help", query: "What can you help me with? Show me all services", labelHi: "सामान्य सहायता" }
];

// Sample responses in multiple languages
const sampleResponses = {
  en: {
    greeting: "Hello! I'm your multilingual campus assistant. I can help you with fees, scholarships, timetables, admissions, and other college information. You can talk to me in Hindi, English, or any of our supported regional languages!",
    thinking: "Processing your query...",
    helpPrompt: "How can I assist you today?"
  },
  hi: {
    greeting: "नमस्ते! मैं आपका बहुभाषी कैंपस असिस्टेंट हूँ। मैं फीस, छात्रवृत्ति, समय सारणी, प्रवेश और अन्य कॉलेज की जानकारी में आपकी मदद कर सकता हूँ। आप हिंदी, अंग्रेजी या हमारी किसी भी समर्थित क्षेत्रीय भाषा में मुझसे बात कर सकते हैं!",
    thinking: "आपके प्रश्न को समझ रहा हूँ...",
    helpPrompt: "आज मैं आपकी कैसे सहायता कर सकता हूँ?"
  }
};

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: sampleResponses.en.greeting,
      isBot: true,
      timestamp: new Date(),
      language: "en",
      confidence: 1.0
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update greeting message when language changes
    setMessages(prev => [
      {
        ...prev[0],
        text: sampleResponses[selectedLanguage]?.greeting || sampleResponses.en.greeting,
        language: selectedLanguage
      },
      ...prev.slice(1)
    ]);
  }, [selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message = inputMessage) => {
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

    // Simulate AI response with context management
    setTimeout(() => {
      let responseText = "";
      const currentLang = sampleResponses[selectedLanguage] || sampleResponses.en;
      
      // Basic intent recognition simulation
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('fee') || lowerMessage.includes('फीस')) {
        responseText = selectedLanguage === 'hi' 
          ? "फीस संबंधी जानकारी: शैक्षणिक वर्ष 2024-25 के लिए फीस ₹50,000 है। अंतिम तारीख 15 जनवरी है। ऑनलाइन भुगतान के लिए कॉलेज पोर्टल का उपयोग करें।"
          : "Fee Information: The academic fee for 2024-25 is ₹50,000. Last date for payment is January 15th. You can pay online through the college portal or visit the accounts office.";
      } else if (lowerMessage.includes('scholarship') || lowerMessage.includes('छात्रवृत्ति')) {
        responseText = selectedLanguage === 'hi'
          ? "छात्रवृत्ति जानकारी: मेधावी छात्रवृत्ति, आर्थिक सहायता, और विशेष श्रेणी छात्रवृत्ति उपलब्ध है। आवेदन की अंतिम तारीख 30 दिसंबर है।"
          : "Scholarship Information: Merit scholarships, financial aid, and category-specific scholarships are available. Application deadline is December 30th. Visit the scholarship cell for more details.";
      } else if (lowerMessage.includes('timetable') || lowerMessage.includes('समय')) {
        responseText = selectedLanguage === 'hi'
          ? "समय सारणी: कक्षाएं सुबह 9:00 बजे से शुरू होती हैं। नवीनतम समय सारणी कॉलेज वेबसाइट पर उपलब्ध है।"
          : "Timetable: Classes start at 9:00 AM. The latest timetable is available on the college website and notice board. Check for any updates regularly.";
      } else {
        responseText = currentLang.helpPrompt + " I can help you with fees, scholarships, timetables, admissions, exam schedules, and general college information.";
      }
      
      const botResponse = {
        id: Date.now() + 1,
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        language: selectedLanguage,
        confidence: 0.95
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message, isBot, timestamp, language, confidence }) => {
    return (
      <div className={`flex gap-3 mb-4 ${isBot ? '' : 'justify-end'}`}>
        <div className={`flex gap-3 max-w-[80%] ${isBot ? '' : 'flex-row-reverse'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isBot ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {isBot ? (
              <Bot className="w-4 h-4 text-blue-600" />
            ) : (
              <User className="w-4 h-4 text-gray-600" />
            )}
          </div>

          <div className={`rounded-2xl px-4 py-3 ${
            isBot 
              ? 'bg-white border border-gray-200 shadow-sm' 
              : 'bg-blue-500 text-white'
          }`}>
            <div className="flex flex-col gap-2">
              {isBot && language && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {languages.find(l => l.code === language)?.name || 'English'}
                  </span>
                  {confidence && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {Math.round(confidence * 100)}% confident
                    </span>
                  )}
                </div>
              )}

              <p className={`text-sm leading-relaxed ${isBot ? 'text-gray-800' : 'text-white'}`}>
                {message}
              </p>

              {timestamp && (
                <span className={`text-xs ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                  {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              )}

              {isBot && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Volume2 className="w-3 h-3 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Copy className="w-3 h-3 text-gray-500" />
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-green-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            {sidebarOpen && (
              <h2 className="font-bold text-gray-900">Campus Assist</h2>
            )}
          </div>
        </div>

        <nav className="px-2">
          <div className="space-y-1">
            <button 
              onClick={() => navigate('/chat')}
              className="w-full flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg"
            >
              <MessageCircle className="w-5 h-5" />
              {sidebarOpen && <span>Chat</span>}
            </button>
            
            <button 
              onClick={() => navigate('/analytics')}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <BarChart3 className="w-5 h-5" />
              {sidebarOpen && <span>Analytics</span>}
            </button>
            
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <UserCog className="w-5 h-5" />
              {sidebarOpen && <span>Admin</span>}
            </button>
            
            <button 
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Multilingual Campus Assistant</h1>
              <p className="text-sm text-gray-600">Smart India Hackathon 2024 - Campus Query Solution</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <PhoneCall className="w-4 h-4" />
                Human Help
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              isBot={message.isBot}
              timestamp={message.timestamp}
              language={message.language}
              confidence={message.confidence}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">
                    {sampleResponses[selectedLanguage]?.thinking || "Processing your query..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && messages.length <= 1 && (
          <div className="p-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {selectedLanguage === 'hi' ? 'त्वरित सहायता' : 'Quick Help'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(action.query)}
                      className="flex items-center gap-2 p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-700">
                        {selectedLanguage === 'hi' ? action.labelHi : action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedLanguage === 'hi' ? 'यहाँ अपना प्रश्न लिखें...' : 'Type your question here...'}
              disabled={isLoading}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {selectedLanguage === 'hi' 
              ? 'आप हिंदी, अंग्रेजी या अन्य भारतीय भाषाओं में प्रश्न पूछ सकते हैं'
              : 'You can ask questions in Hindi, English, or other Indian languages'
            }
          </p>
        </div>
      </div>
    </div>
  );
}