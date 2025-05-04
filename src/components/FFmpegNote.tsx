
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const FFmpegNote = () => {
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for SharedArrayBuffer support which is required for FFmpeg.wasm
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    setIsCompatible(hasSharedArrayBuffer);
  }, []);

  return (
    <Card className={`mt-8 ${isCompatible === false ? 'bg-destructive/10 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {isCompatible === false ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          FFmpeg Processing Note
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {isCompatible === false && (
          <div className="mb-3 p-2 bg-destructive/10 rounded">
            <p className="font-medium text-destructive">
              Your browser may not fully support FFmpeg.wasm
            </p>
            <p className="text-xs mt-1">
              For best experience, use Chrome, Edge or Firefox with "SharedArrayBuffer" support enabled.
            </p>
          </div>
        )}
        
        <p className="mb-2">
          This web app uses FFmpeg.wasm to process videos entirely in your browser:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>All processing happens locally - your files never leave your computer</li>
          <li>Modern browsers (Chrome, Edge, Firefox) with SharedArrayBuffer support are required</li>
          <li>Complex operations may take time depending on your device's capabilities</li>
          <li>For best results with image sequences, number files sequentially (e.g., img001.jpg, img002.jpg)</li>
          <li>Supported codecs and formats depend on FFmpeg.wasm capabilities</li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          FFmpeg Script Tips:
          <code className="block bg-muted p-2 rounded mt-1 text-[10px] overflow-x-auto">
            # Basic video conversion<br/>
            -i input_0.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4<br/><br/>
            # Image sequence to video<br/>
            -framerate 30 -i input_%d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4<br/><br/>
            # Add fade in/out<br/>
            -i input_0.mp4 -vf "fade=in:0:30,fade=out:300:30" -c:a copy output.mp4
          </code>
        </p>
      </CardContent>
    </Card>
  );
};

export default FFmpegNote;
