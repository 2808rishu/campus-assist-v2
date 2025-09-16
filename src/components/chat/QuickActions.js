import React from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, CreditCard, Calendar, FileText, HelpCircle, Clock } from "lucide-react";

const quickActions = [
  { 
    icon: CreditCard, 
    label: "Fee Information", 
    query: "Tell me about fee structure and payment deadlines",
    category: "fees"
  },
  { 
    icon: GraduationCap, 
    label: "Scholarships", 
    query: "What scholarships are available?",
    category: "scholarships"
  },
  { 
    icon: Calendar, 
    label: "Timetable", 
    query: "Show me the current timetable",
    category: "timetable"
  },
  { 
    icon: FileText, 
    label: "Admissions", 
    query: "How do I apply for admission?",
    category: "admissions"
  },
  { 
    icon: Clock, 
    label: "Exam Schedule", 
    query: "When are the upcoming exams?",
    category: "exams"
  },
  { 
    icon: HelpCircle, 
    label: "General Help", 
    query: "What can you help me with?",
    category: "general"
  }
];

export default function QuickActions({ onActionClick, language }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {language === 'hi' ? 'त्वरित सहायता' : 'Quick Actions'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action.query, action.category)}
              className="flex items-center gap-2 h-auto p-3 text-left justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 leading-tight">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        {language === 'hi' 
          ? 'या किसी भी विषय के बारे में पूछें या अपना प्रश्न टाइप करें' 
          : 'Click any topic above or type your own question'
        }
      </p>
    </div>
  );
}