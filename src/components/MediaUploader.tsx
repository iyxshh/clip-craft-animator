
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileVideo, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  onMediaUpload: (files: File[]) => void;
}

const MediaUploader = ({ onMediaUpload }: MediaUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      
      if (validFiles.length) {
        handleFiles(validFiles);
      } else {
        toast({
          title: "Invalid files",
          description: "Please upload images or videos only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      
      if (validFiles.length) {
        handleFiles(validFiles);
      } else {
        toast({
          title: "Invalid files",
          description: "Please upload images or videos only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    onMediaUpload(newFiles);
    
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) added successfully.`,
    });
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileVideo className="h-4 w-4" />;
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    onMediaUpload(newFiles);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Files</CardTitle>
        <CardDescription>
          Upload images and videos for processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-8 text-center transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border",
            "hover:border-primary/50 hover:bg-primary/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileInputChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Drag & drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports images and videos
          </p>
          <Button onClick={handleButtonClick} variant="secondary">
            Select Files
          </Button>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollable-area pr-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                  <div className="flex items-center">
                    {getFileIcon(file)}
                    <span className="ml-2 text-sm truncate max-w-[300px]">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-6 w-6 p-0">
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaUploader;
