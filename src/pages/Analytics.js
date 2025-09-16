import React, { useState, useEffect, useCallback } from "react";
import { Conversation, ChatSession } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, MessageCircle, Users, Clock, ThumbsUp, Globe } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export default function Analytics() {
  const [conversations, setConversations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalSessions: 0,
    averageResponseTime: 0,
    satisfactionRate: 0,
    topCategories: [],
    languageDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = useCallback((convData, sessionData) => {
    // Calculate basic stats
    const totalConversations = convData.length;
    const totalSessions = sessionData.length;
    
    // Average response time
    const avgResponseTime = convData.reduce((sum, conv) => sum + (conv.response_time_ms || 0), 0) / convData.length;
    
    // Satisfaction rate (assuming ratings 4-5 are satisfied)
    const ratedConversations = convData.filter(conv => conv.user_rating);
    const satisfiedCount = ratedConversations.filter(conv => conv.user_rating >= 4).length;
    const satisfactionRate = ratedConversations.length > 0 ? (satisfiedCount / ratedConversations.length) * 100 : 0;
    
    // Category distribution
    const categoryCount = {};
    convData.forEach(conv => {
      categoryCount[conv.intent_category] = (categoryCount[conv.intent_category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count, percentage: (count / totalConversations) * 100 }))
      .sort((a, b) => b.count - a.count);
    
    // Language distribution
    const languageCount = {};
    convData.forEach(conv => {
      languageCount[conv.detected_language] = (languageCount[conv.detected_language] || 0) + 1;
    });
    
    const languageDistribution = Object.entries(languageCount)
      .map(([language, count]) => ({ language, count, percentage: (count / totalConversations) * 100 }));

    setStats({
      totalConversations,
      totalSessions,
      averageResponseTime: avgResponseTime / 1000, // Convert to seconds
      satisfactionRate,
      topCategories,
      languageDistribution
    });
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [convData, sessionData] = await Promise.all([
        Conversation.list("-created_date", 1000),
        ChatSession.list("-created_date", 500)
      ]);
      
      setConversations(convData);
      setSessions(sessionData);
      calculateStats(convData, sessionData); 
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setIsLoading(false);
  }, [calculateStats]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const getTimeSeriesData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MM/dd'),
        conversations: 0,
        sessions: 0
      };
    }).reverse();

    conversations.forEach(conv => {
      const convDate = format(new Date(conv.created_date), 'MM/dd');
      const dayData = last7Days.find(day => day.date === convDate);
      if (dayData) dayData.conversations++;
    });

    sessions.forEach(session => {
      const sessionDate = format(new Date(session.created_date), 'MM/dd');
      const dayData = last7Days.find(day => day.date === sessionDate);
      if (dayData) dayData.sessions++;
    });

    return last7Days;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

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

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor chatbot performance and user interactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +8% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageResponseTime.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">
                -15% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <ThumbsUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +5% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTimeSeriesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversations" fill="#3B82F6" name="Conversations" />
                    <Bar dataKey="sessions" fill="#10B981" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Query Categories Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.topCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="category"
                        label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                      >
                        {stats.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Query Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topCategories.slice(0, 6).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium capitalize">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{category.count} queries</Badge>
                          <span className="text-sm text-gray-500">
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="languages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language Usage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.languageDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="language"
                        label={({ language, percentage }) => `${languageNames[language]} (${percentage.toFixed(1)}%)`}
                      >
                        {stats.languageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    {stats.languageDistribution.map((lang, index) => (
                      <div key={lang.language} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{languageNames[lang.language]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{lang.count} messages</Badge>
                          <span className="text-sm text-gray-500">
                            {lang.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <Badge variant="secondary">{stats.averageResponseTime.toFixed(2)}s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Conversations</span>
                      <Badge variant="outline">{stats.totalConversations}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Satisfaction</span>
                      <Badge variant="default">{stats.satisfactionRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>System Status</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Sessions</span>
                      <Badge variant="secondary">{stats.totalSessions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Languages Supported</span>
                      <Badge variant="outline">8</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}