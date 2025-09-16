import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageCircle, Settings, BarChart3, Database, Users, Globe, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Chat",
    url: createPageUrl("Chat"),
    icon: MessageCircle,
  },
  {
    title: "Knowledge Base",
    url: createPageUrl("Admin"),
    icon: Database,
  },
  {
    title: "College Assets",
    url: createPageUrl("CollegeAdmin"),
    icon: Shield,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <Sidebar className="border-r border-blue-200/50 bg-white/80 backdrop-blur-sm w-64">
          <SidebarHeader className="border-b border-blue-200/50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">CampusAssist</h2>
                <p className="text-xs text-gray-500">Multilingual Assistant</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`w-full hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg p-3 ${
                          location.pathname === item.url ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600 text-xs">Active Sessions</span>
                    </div>
                    <span className="font-semibold text-blue-600 text-sm">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-xs">Today's Queries</span>
                    </div>
                    <span className="font-semibold text-green-600 text-sm">84</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-gray-600 text-xs">Languages</span>
                    </div>
                    <span className="font-semibold text-purple-600 text-sm">8</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-200/50 p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Campus Chatbot v2.0</p>
              <p className="text-xs text-gray-400">Serving students 24/7</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200/50 px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-gray-900">CampusAssist</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}