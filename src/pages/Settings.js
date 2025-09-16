import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings as SettingsIcon, Globe, Bot, Shield, Bell, Save, RefreshCw } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    chatbotName: "Campus Assistant",
    welcomeMessage: "Hello! I'm your campus assistant. I can help you with fees, scholarships, timetables, and other college information.",
    defaultLanguage: "en",
    enableMultilingual: true,
    maxResponseLength: 500,
    
    // Language Settings
    supportedLanguages: ["en", "hi", "mr", "gu"],
    autoDetectLanguage: true,
    
    // Bot Behavior
    confidenceThreshold: 0.7,
    escalationThreshold: 0.5,
    enableContextMemory: true,
    maxContextTurns: 5,
    
    // Integration Settings
    humanSupportEmail: "support@college.edu",
    humanSupportPhone: "+91-XXX-XXXXXXX",
    officeHours: "9:00 AM - 5:00 PM",
    
    // Analytics & Privacy
    enableAnalytics: true,
    logConversations: true,
    retainDataDays: 90,
    anonymizeData: false,
    
    // Notifications
    enableEmailAlerts: true,
    lowConfidenceAlert: true,
    dailySummaryReport: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

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

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSavedMessage("Settings saved successfully!");
    setIsSaving(false);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleLanguageSupport = (langCode) => {
    setSettings(prev => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(langCode)
        ? prev.supportedLanguages.filter(lang => lang !== langCode)
        : [...prev.supportedLanguages, langCode]
    }));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
            <p className="text-gray-600 mt-2">Configure your multilingual campus assistant</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {savedMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {savedMessage}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chatbot Name</label>
                    <Input
                      value={settings.chatbotName}
                      onChange={(e) => handleSettingChange("chatbotName", e.target.value)}
                      placeholder="Campus Assistant"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Default Language</label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) => handleSettingChange("defaultLanguage", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Welcome Message</label>
                  <Textarea
                    value={settings.welcomeMessage}
                    onChange={(e) => handleSettingChange("welcomeMessage", e.target.value)}
                    rows={3}
                    placeholder="Enter the welcome message for new users"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Response Length</label>
                    <Input
                      type="number"
                      value={settings.maxResponseLength}
                      onChange={(e) => handleSettingChange("maxResponseLength", parseInt(e.target.value))}
                      min="100"
                      max="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum characters in chatbot responses</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Multilingual Support</label>
                      <p className="text-xs text-gray-500">Allow users to chat in multiple languages</p>
                    </div>
                    <Switch
                      checked={settings.enableMultilingual}
                      onCheckedChange={(checked) => handleSettingChange("enableMultilingual", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-detect Language</label>
                    <p className="text-xs text-gray-500">Automatically detect user's preferred language</p>
                  </div>
                  <Switch
                    checked={settings.autoDetectLanguage}
                    onCheckedChange={(checked) => handleSettingChange("autoDetectLanguage", checked)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Supported Languages</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map(lang => (
                      <div
                        key={lang.code}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          settings.supportedLanguages.includes(lang.code)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleLanguageSupport(lang.code)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{lang.nativeName}</p>
                            <p className="text-xs text-gray-500">{lang.name}</p>
                          </div>
                          {settings.supportedLanguages.includes(lang.code) && (
                            <Badge variant="secondary" className="text-xs">Active</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected languages: {settings.supportedLanguages.length}/8
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Bot Behavior Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Confidence Threshold</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={settings.confidenceThreshold}
                      onChange={(e) => handleSettingChange("confidenceThreshold", parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum confidence required to provide automated response (0.0-1.0)
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Escalation Threshold</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={settings.escalationThreshold}
                      onChange={(e) => handleSettingChange("escalationThreshold", parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence below which queries are escalated to humans
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Context Memory</label>
                      <p className="text-xs text-gray-500">Remember conversation context</p>
                    </div>
                    <Switch
                      checked={settings.enableContextMemory}
                      onCheckedChange={(checked) => handleSettingChange("enableContextMemory", checked)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Context Turns</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxContextTurns}
                      onChange={(e) => handleSettingChange("maxContextTurns", parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of previous messages to remember
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Integration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Human Support Email</label>
                    <Input
                      value={settings.humanSupportEmail}
                      onChange={(e) => handleSettingChange("humanSupportEmail", e.target.value)}
                      placeholder="support@college.edu"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Human Support Phone</label>
                    <Input
                      value={settings.humanSupportPhone}
                      onChange={(e) => handleSettingChange("humanSupportPhone", e.target.value)}
                      placeholder="+91-XXX-XXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Office Hours</label>
                  <Input
                    value={settings.officeHours}
                    onChange={(e) => handleSettingChange("officeHours", e.target.value)}
                    placeholder="9:00 AM - 5:00 PM"
                  />
                  <p className="text-xs text-gray-500 mt-1">When human support is available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Privacy & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Analytics</label>
                      <p className="text-xs text-gray-500">Collect usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.enableAnalytics}
                      onCheckedChange={(checked) => handleSettingChange("enableAnalytics", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Log Conversations</label>
                      <p className="text-xs text-gray-500">Store conversation history</p>
                    </div>
                    <Switch
                      checked={settings.logConversations}
                      onCheckedChange={(checked) => handleSettingChange("logConversations", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Retention (Days)</label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.retainDataDays}
                      onChange={(e) => handleSettingChange("retainDataDays", parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long to keep conversation data
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Anonymize Data</label>
                      <p className="text-xs text-gray-500">Remove personal identifiers</p>
                    </div>
                    <Switch
                      checked={settings.anonymizeData}
                      onCheckedChange={(checked) => handleSettingChange("anonymizeData", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Enable Email Alerts</label>
                        <p className="text-xs text-gray-500">Receive system notifications</p>
                      </div>
                      <Switch
                        checked={settings.enableEmailAlerts}
                        onCheckedChange={(checked) => handleSettingChange("enableEmailAlerts", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Low Confidence Alerts</label>
                        <p className="text-xs text-gray-500">Alert on poor response quality</p>
                      </div>
                      <Switch
                        checked={settings.lowConfidenceAlert}
                        onCheckedChange={(checked) => handleSettingChange("lowConfidenceAlert", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Daily Summary Report</label>
                        <p className="text-xs text-gray-500">Daily analytics summary</p>
                      </div>
                      <Switch
                        checked={settings.dailySummaryReport}
                        onCheckedChange={(checked) => handleSettingChange("dailySummaryReport", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}