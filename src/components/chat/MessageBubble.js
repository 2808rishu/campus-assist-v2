import React from "react";
import { motion } from "framer-motion";
import { Bot, User, ThumbsUp, ThumbsDown, Copy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const languageNames = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी", 
  gu: "ગુજરાતી",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ"
};

export default function MessageBubble({ 
  message, 
  isBot, 
  timestamp, 
  language, 
  confidence, 
  onRate, 
  onCopy,
  onSpeak 
}) {
  const [rating, setRating] = React.useState(null);

  const handleRate = (score) => {
    setRating(score);
    onRate?.(score);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    onCopy?.();
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    speechSynthesis.speak(utterance);
    onSpeak?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${isBot ? '' : 'justify-end'}`}
    >
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
            ? 'bg-white border border-blue-200 shadow-sm' 
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex flex-col gap-2">
            {isBot && language && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {languageNames[language]}
                </Badge>
                {confidence && (
                  <Badge 
                    variant={confidence > 0.8 ? "default" : confidence > 0.5 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {Math.round(confidence * 100)}% confident
                  </Badge>
                )}
              </div>
            )}

            <p className={`text-sm leading-relaxed ${isBot ? 'text-gray-800' : 'text-white'}`}>
              {message}
            </p>

            {timestamp && (
              <span className={`text-xs ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                {format(new Date(timestamp), 'HH:mm')}
              </span>
            )}

            {isBot && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeak}
                  className="h-6 px-2 text-gray-500 hover:text-gray-700"
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2 text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRate(1)}
                    className={`h-6 px-1 ${rating === 1 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRate(5)}
                    className={`h-6 px-1 ${rating === 5 ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}