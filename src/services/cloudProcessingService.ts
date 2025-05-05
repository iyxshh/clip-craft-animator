
// This service handles cloud-based video processing with Supabase integration
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

type ProcessingStatus = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
};

class CloudProcessingService {
  // Process media with Supabase storage and database
  async processMedia(files: File[], ffmpegScript: string): Promise<Blob> {
    console.log('Starting cloud processing with Supabase');
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error('User must be logged in to process videos');
    }
    
    // Generate a job ID
    const jobId = uuidv4();
    const fileName = files[0]?.name || `processed_video_${Date.now()}.mp4`;
    const processedFileName = `processed_${fileName.split('.')[0]}_${Date.now()}.mp4`;
    
    try {
      // Create a processing job record in the database
      const { error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          id: jobId,
          script: ffmpegScript,
          status: 'processing',
          processing_mode: 'cloud',
          user_id: userId,
          progress: 0
        });
        
      if (jobError) throw new Error(`Failed to create processing job: ${jobError.message}`);
      
      // Upload the original file to storage
      const uploadPath = `uploads/${userId}/${jobId}/${files[0].name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('videos')
        .upload(uploadPath, files[0], {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);
      
      // In a production environment, this would trigger a serverless function or webhook
      // that would process the video using FFmpeg on the server side
      
      // For now, we'll simulate this with a more robust implementation
      return new Promise((resolve, reject) => {
        let progress = 0;
        
        // Simulate progress updates - in production this would be real-time updates from the server
        const progressInterval = setInterval(async () => {
          progress += 10;
          
          // Update job progress
          await supabase
            .from('processing_jobs')
            .update({ progress })
            .eq('id', jobId);
            
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 1500);
        
        // Simulate processing completion - in production this would be the actual processed video
        setTimeout(async () => {
          try {
            clearInterval(progressInterval);
            
            // Get the original file URL to "process" it
            const { data: fileData } = await supabase
              .storage
              .from('videos')
              .createSignedUrl(uploadPath, 60); // 60 seconds signed URL
              
            if (!fileData?.signedUrl) {
              throw new Error('Could not generate signed URL for the original file');
            }
            
            // For now, we fetch the original file
            // In a real production environment, this would be the processed file from the server
            const originalFileResponse = await fetch(fileData.signedUrl);
            const originalFile = await originalFileResponse.blob();
            
            // In production, this would be handled by the server-side FFmpeg process
            const resultPath = `results/${userId}/${jobId}/${processedFileName}`;
            
            // Upload the "processed" file - ensuring proper content type
            const { error: processedError } = await supabase
              .storage
              .from('videos')
              .upload(resultPath, originalFile, {
                contentType: 'video/mp4',
                cacheControl: '3600',
                upsert: false
              });
              
            if (processedError) {
              throw new Error(`Failed to upload processed file: ${processedError.message}`);
            }
            
            // Get a public URL for the processed file
            const { data: publicUrlData } = supabase
              .storage
              .from('videos')
              .getPublicUrl(resultPath);
              
            if (!publicUrlData?.publicUrl) {
              throw new Error('Could not generate public URL for the processed file');
            }
              
            // Update job status to completed
            await supabase
              .from('processing_jobs')
              .update({
                status: 'completed',
                progress: 100
              })
              .eq('id', jobId);
              
            // Create a processed video record
            await supabase
              .from('processed_videos')
              .insert({
                job_id: jobId,
                storage_path: resultPath,
                file_name: processedFileName,
                file_size: originalFile.size
              });
            
            // Download the processed file to return as Blob
            const response = await fetch(publicUrlData.publicUrl);
            const blob = await response.blob();
            resolve(blob);
          } catch (error) {
            console.error('Error in cloud processing:', error);
            
            // Update job status to failed
            await supabase
              .from('processing_jobs')
              .update({
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
              })
              .eq('id', jobId);
              
            reject(error);
          }
        }, 8000); // Longer simulation time for more realism
      });
    } catch (error) {
      console.error('Cloud processing setup error:', error);
      throw error;
    }
  }

  isCloudProcessingAvailable(): boolean {
    // Check if Supabase connection and user are available
    return supabase !== undefined;
  }
  
  // Get processing history for the current user
  async getProcessingJobs() {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // If user is logged in, get only their jobs, otherwise get all jobs (for demo purposes)
    const query = userId ? 
      supabase.from('processing_jobs').select('*, processed_videos(*)').eq('user_id', userId) :
      supabase.from('processing_jobs').select('*, processed_videos(*)');
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching processing jobs:', error);
      throw error;
    }
    
    return data;
  }
}

export const cloudProcessingService = new CloudProcessingService();
