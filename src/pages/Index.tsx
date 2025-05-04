
import { useState } from "react";
import Header from "@/components/Header";
import MediaUploader from "@/components/MediaUploader";
import ScriptEditor from "@/components/ScriptEditor";
import VideoPreview from "@/components/VideoPreview";
import FFmpegNote from "@/components/FFmpegNote";
import { useToast } from "@/hooks/use-toast";
import { ffmpegService } from "@/services/ffmpegService";

const Index = () => {
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [ffmpegScript, setFfmpegScript] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  
  const { toast } = useToast();

  const handleMediaUpload = (files: File[]) => {
    setUploadedMedia(files);
    
    // Reset state when new files are uploaded
    if (isProcessed) {
      setIsProcessed(false);
      setVideoUrl(null);
    }
  };

  const handleScriptChange = (script: string) => {
    setFfmpegScript(script);
  };

  const handleProcessVideo = async () => {
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
    setProcessingProgress(0);
    
    try {
      // Check for SharedArrayBuffer support
      if (typeof SharedArrayBuffer === 'undefined') {
        toast({
          title: "Browser Compatibility Issue",
          description: "Your browser doesn't support SharedArrayBuffer which is required for FFmpeg. Try using Chrome or Edge.",
          variant: "destructive",
        });
        throw new Error("Browser doesn't support SharedArrayBuffer");
      }
      
      // Load FFmpeg with progress updates
      toast({
        title: "Loading FFmpeg",
        description: "Please wait while FFmpeg is being initialized...",
      });
      await ffmpegService.load();
      setProcessingProgress(20);

      // Process the media
      toast({
        title: "Processing Started",
        description: "FFmpeg is processing your media. This may take a moment...",
      });
      
      // Process the video
      const outputBlob = await ffmpegService.processMedia(uploadedMedia, ffmpegScript);
      setProcessingProgress(90);
      
      // Create URL for the processed video
      const url = URL.createObjectURL(outputBlob);
      setVideoUrl(url);
      setIsProcessed(true);
      setProcessingProgress(100);
      
      toast({
        title: "Processing Complete",
        description: "Your video has been processed. You can now preview and download it.",
      });
    } catch (error) {
      console.error("Error processing video:", error);
      
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while processing your video.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
          isProcessing={isProcessing}
          processingProgress={processingProgress}
        />
        
        <FFmpegNote />
      </main>
    </div>
  );
};

export default Index;
