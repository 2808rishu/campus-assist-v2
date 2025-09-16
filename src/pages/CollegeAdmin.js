import React, { useState, useEffect } from "react";
import { CollegeAsset } from "@/entities/all";
import AssetUploader from "../components/admin/AssetUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Copy, Trash2, FileText, Image as ImageIcon, Search, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

export default function CollegeAdmin() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const data = await CollegeAsset.list("-created_date");
      setAssets(data);
      setSaveError(null);
    } catch (error) {
      console.error("Error loading assets:", error);
      setSaveError("Failed to load assets. Please refresh the page.");
    }
    setIsLoading(false);
  };

  const handleUploadComplete = async (assetData) => {
    try {
      setSaveError(null);
      await CollegeAsset.create(assetData);
      await loadAssets(); // Refresh the list
    } catch (error) {
      console.error("Error creating asset record:", error);
      setSaveError("File uploaded but failed to save record. Please contact support.");
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (confirm(`Are you sure you want to delete "${asset.file_name}"? This action cannot be undone.`)) {
      try {
        await CollegeAsset.delete(asset.id);
        loadAssets(); // Refresh the list
      } catch (error) {
        console.error("Error deleting asset:", error);
        setSaveError("Failed to delete asset. Please try again.");
      }
    }
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback: select text for manual copy
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getFileTypeLabel = (fileType) => {
    if (fileType.startsWith("image/")) return "Image";
    if (fileType === "application/pdf") return "PDF";
    if (fileType.includes("word")) return "Word Doc";
    if (fileType === "text/plain") return "Text";
    return "Document";
  };

  const filteredAssets = assets.filter(asset =>
    asset.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getFileTypeLabel(asset.file_type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">College Asset Management</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage documents, images, and other files for your college chatbot.
          </p>
        </div>

        {saveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{saveError}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSaveError(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetUploader onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Uploaded Assets ({assets.length})</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" onClick={loadAssets} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded On</TableHead>
                    <TableHead className="w-48">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading assets...
                      </TableCell>
                    </TableRow>
                  ) : filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? `No assets found matching "${searchTerm}"` : "No assets uploaded yet. Upload your first file above!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(asset.file_type)}
                            <Badge variant="outline" className="text-xs">
                              {getFileTypeLabel(asset.file_type)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{asset.file_name}</p>
                            {asset.description && (
                              <p className="text-sm text-gray-500">{asset.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {/* File size not available in current entity, showing placeholder */}
                          —
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(asset.created_date), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(asset.file_url, '_blank')}
                              className="flex-1"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyUrl(asset.file_url)}
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {copiedUrl === asset.file_url ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAsset(asset)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}