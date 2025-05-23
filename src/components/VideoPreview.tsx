
import { useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Video, Laptop, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface VideoPreviewProps {
  videoUrl: string | null;
  isProcessed: boolean;
  isProcessing?: boolean;
  processingProgress?: number;
  processingMode?: string;
}

const VideoPreview = ({ 
  videoUrl, 
  isProcessed, 
  isProcessing = false, 
  processingProgress = 0,
  processingMode = "local" 
}: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "processed-video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your processed video is being downloaded.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Video Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessing && (
          <div className="flex flex-col items-center justify-center bg-black/20 aspect-video rounded-md p-4">
            <Video className="h-16 w-16 text-primary animate-pulse mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              {processingMode === "cloud" ? (
                <span className="flex items-center justify-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Processing in cloud...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Laptop className="h-4 w-4" />
                  Processing locally...
                </span>
              )}
            </p>
            <Progress value={processingProgress} className="w-full max-w-md" />
            <p className="text-xs text-muted-foreground mt-2">{processingProgress}% complete</p>
          </div>
        )}
        
        {!isProcessing && videoUrl ? (
          <div className="relative aspect-video bg-black/20 rounded-md overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : !isProcessing ? (
          <div className="flex flex-col items-center justify-center bg-black/20 aspect-video rounded-md p-4">
            <Video className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground text-center">
              Process your video to see a preview here
            </p>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex gap-2 justify-between">
        <Button
          variant="secondary"
          disabled={!videoUrl || isProcessing}
          onClick={handlePlayPause}
        >
          <Play className="h-4 w-4 mr-2" />
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button 
          disabled={!isProcessed || isProcessing} 
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoPreview;
