import React, { useState, useEffect } from "react";
import { KnowledgeBase } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Admin() {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");

  const categories = ["fees", "scholarships", "timetable", "admissions", "exams", "general"];
  const languages = ["en", "hi", "mr", "gu", "bn", "ta", "te", "kn"];

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    setIsLoading(true);
    const data = await KnowledgeBase.list("-updated_date");
    setKnowledgeItems(data);
    setIsLoading(false);
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesLanguage = filterLanguage === "all" || item.language === filterLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        await KnowledgeBase.update(editingItem.id, formData);
      } else {
        await KnowledgeBase.create(formData);
      }
      loadKnowledgeBase();
      setShowAddDialog(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving knowledge item:", error);
    }
  };

  const handleDeleteItem = async (item) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await KnowledgeBase.delete(item.id);
      loadKnowledgeBase();
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddDialog(true);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Management</h1>
            <p className="text-gray-600 mt-2">Manage FAQs and responses for the chatbot</p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions or answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {filteredItems.length} items found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Items */}
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant="outline">{item.language.toUpperCase()}</Badge>
                    {item.priority > 7 && <Badge variant="destructive">High Priority</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Question:</h3>
                    <p className="text-gray-700">{item.question}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Answer:</h3>
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                  {item.keywords && item.keywords.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Keywords:</h3>
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <KnowledgeItemDialog
          open={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
          item={editingItem}
          categories={categories}
          languages={languages}
        />
      </div>
    </div>
  );
}

function KnowledgeItemDialog({ open, onClose, onSave, item, categories, languages }) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    language: "en",
    keywords: [],
    priority: 5,
    is_active: true,
    source_document: ""
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        question: "",
        answer: "",
        category: "general",
        language: "en",
        keywords: [],
        priority: 5,
        is_active: true,
        source_document: ""
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleKeywordsChange = (value) => {
    const keywords = value.split(",").map(k => k.trim()).filter(k => k);
    setFormData(prev => ({ ...prev, keywords }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Knowledge Item" : "Add New Knowledge Item"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Question</label>
            <Textarea
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter the question or query"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Answer</label>
            <Textarea
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              placeholder="Enter the response"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Keywords (comma separated)</label>
            <Input
              value={formData.keywords?.join(", ") || ""}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priority (1-10)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Source Document</label>
              <Input
                value={formData.source_document}
                onChange={(e) => setFormData(prev => ({ ...prev, source_document: e.target.value }))}
                placeholder="Reference document or circular"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {item ? "Update" : "Create"} Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}