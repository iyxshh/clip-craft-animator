import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History, Download, Play, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cloudProcessingService } from "@/services/cloudProcessingService";
import { supabase } from "@/integrations/supabase/client";

interface ProcessingJob {
  id: string;
  status: string;
  script: string;
  progress: number;
  processing_mode: string;
  created_at: string;
  processed_videos: {
    id: string;
    storage_path: string;
    file_name: string;
  }[];
}

const ProcessingHistory = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await cloudProcessingService.getProcessingJobs();
      setJobs(data || []);
    } catch (error) {
      toast({
        title: "Error loading history",
        description: error instanceof Error ? error.message : "Failed to load processing history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handlePlayVideo = (storageUrl: string) => {
    // Get a public URL for the file
    const { data } = supabase
      .storage
      .from('videos')
      .getPublicUrl(storageUrl);
      
    if (data?.publicUrl) {
      // Open the video in a new tab
      window.open(data.publicUrl, '_blank');
    } else {
      toast({
        title: "Playback Error",
        description: "Unable to play this video. The file may no longer exist.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadVideo = async (storageUrl: string, fileName: string) => {
    try {
      // Get a public URL for the file
      const { data } = supabase
        .storage
        .from('videos')
        .getPublicUrl(storageUrl);
        
      if (data?.publicUrl) {
        // Create an anchor element and trigger download
        const link = document.createElement('a');
        link.href = data.publicUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: "Your video is being downloaded.",
        });
      } else {
        throw new Error("Unable to generate download URL");
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : "Failed to download video",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Processing History
          </CardTitle>
          <CardDescription>
            View your previous video processing jobs
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadHistory} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? 
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading processing history...</p>
              </div>
              : 
              <p>No processing jobs found. Process a video to see history.</p>
            }
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className="font-medium capitalize">{job.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(job.created_at)}</span>
                </div>
                
                <div className="text-sm mb-2 line-clamp-2 font-mono bg-secondary/50 p-2 rounded">
                  {job.script}
                </div>
                
                {job.status === 'processing' && (
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {job.processed_videos && job.processed_videos.length > 0 && (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePlayVideo(job.processed_videos[0].storage_path)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDownloadVideo(
                        job.processed_videos[0].storage_path,
                        job.processed_videos[0].file_name
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingHistory;
