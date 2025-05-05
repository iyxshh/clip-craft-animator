
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MediaUploader from "@/components/MediaUploader";
import ScriptEditor from "@/components/ScriptEditor";
import VideoPreview from "@/components/VideoPreview";
import ProcessingHistory from "@/components/ProcessingHistory";
import FFmpegNote from "@/components/FFmpegNote";
import { useToast } from "@/hooks/use-toast";
import { ffmpegService } from "@/services/ffmpegService";
import { cloudProcessingService } from "@/services/cloudProcessingService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [ffmpegScript, setFfmpegScript] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [processingMode, setProcessingMode] = useState<string>("local");
  const [activeTab, setActiveTab] = useState<string>("process");
  
  const { toast } = useToast();

  useEffect(() => {
    // Check browser compatibility on component mount
    setIsCompatible(ffmpegService.isFFmpegSupported());
  }, []);

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

  const handleProcessVideo = async (useCloudProcessing = false) => {
    // Update processing mode
    setProcessingMode(useCloudProcessing ? "cloud" : "local");
    
    if (!useCloudProcessing && !isCompatible) {
      toast({
        title: "Browser Compatibility Issue",
        description: "Your browser doesn't support SharedArrayBuffer which is required for local FFmpeg processing. Switching to cloud processing.",
        variant: "destructive",
      });
      // Force cloud processing if local is not supported
      useCloudProcessing = true;
    }
    
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
      let outputBlob: Blob;
      
      if (useCloudProcessing) {
        // Use cloud processing
        toast({
          title: "Cloud Processing Started",
          description: "Your media is being processed in the cloud. This may take a moment...",
        });
        
        // Process via cloud service with Supabase
        outputBlob = await cloudProcessingService.processMedia(uploadedMedia, ffmpegScript);
        setProcessingProgress(100);
      } else {
        // Use local processing with FFmpeg.wasm
        toast({
          title: "Loading FFmpeg",
          description: "Please wait while FFmpeg is being initialized...",
        });
        await ffmpegService.load();
        setProcessingProgress(20);

        toast({
          title: "Local Processing Started",
          description: "FFmpeg is processing your media. This may take a moment...",
        });
        
        // Process the video locally
        outputBlob = await ffmpegService.processMedia(uploadedMedia, ffmpegScript);
        setProcessingProgress(90);
      }
      
      // Create URL for the processed video
      const url = URL.createObjectURL(outputBlob);
      setVideoUrl(url);
      setIsProcessed(true);
      setProcessingProgress(100);
      
      toast({
        title: "Processing Complete",
        description: `Your video has been processed ${useCloudProcessing ? 'in the cloud' : 'locally'}. You can now preview and download it.`,
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
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 w-[400px] mb-4">
            <TabsTrigger value="process">Process Video</TabsTrigger>
            <TabsTrigger value="history">Processing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <MediaUploader onMediaUpload={handleMediaUpload} />
              <ScriptEditor 
                onScriptChange={handleScriptChange}
                onProcessVideo={handleProcessVideo}
                isProcessing={isProcessing}
                isCompatible={isCompatible}
              />
            </div>
            <VideoPreview 
              videoUrl={videoUrl}
              isProcessed={isProcessed}
              isProcessing={isProcessing}
              processingProgress={processingProgress}
              processingMode={processingMode}
            />
            
            <FFmpegNote />
          </TabsContent>
          
          <TabsContent value="history">
            <ProcessingHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
