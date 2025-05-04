
import { useState } from "react";
import Header from "@/components/Header";
import MediaUploader from "@/components/MediaUploader";
import ScriptEditor from "@/components/ScriptEditor";
import VideoPreview from "@/components/VideoPreview";
import FFmpegNote from "@/components/FFmpegNote";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [ffmpegScript, setFfmpegScript] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  
  const { toast } = useToast();

  const handleMediaUpload = (files: File[]) => {
    setUploadedMedia(files);
  };

  const handleScriptChange = (script: string) => {
    setFfmpegScript(script);
  };

  const handleProcessVideo = () => {
    if (uploadedMedia.length === 0) {
      toast({
        title: "No media files",
        description: "Please upload at least one image or video file.",
        variant: "destructive",
      });
      return;
    }

    if (!ffmpegScript.trim()) {
      toast({
        title: "Empty script",
        description: "Please enter a FFmpeg script to process your media.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // In a real app, we would process the video using FFmpeg.js or WebAssembly
      // For this demo, we'll just set a sample video URL
      const sampleFile = uploadedMedia.find(file => file.type.startsWith('video/'));
      
      if (sampleFile) {
        const url = URL.createObjectURL(sampleFile);
        setVideoUrl(url);
        setIsProcessed(true);
      } else {
        // Create a canvas element to render a simple video with the first image
        const image = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx && uploadedMedia[0].type.startsWith('image/')) {
          canvas.width = 640;
          canvas.height = 480;
          
          image.onload = () => {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                setIsProcessed(true);
              }
            }, 'image/jpeg');
          };
          
          image.src = URL.createObjectURL(uploadedMedia[0]);
        }
      }
      
      setIsProcessing(false);
      
      toast({
        title: "Processing Complete",
        description: "Your video has been processed. You can now preview and download it.",
      });
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MediaUploader onMediaUpload={handleMediaUpload} />
          <ScriptEditor 
            onScriptChange={handleScriptChange}
            onProcessVideo={handleProcessVideo}
            isProcessing={isProcessing}
          />
        </div>
        <VideoPreview 
          videoUrl={videoUrl}
          isProcessed={isProcessed}
        />
        
        <FFmpegNote />
      </main>
    </div>
  );
};

export default Index;
