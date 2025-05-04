
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const FFmpegNote = () => {
  return (
    <Card className="mt-8 bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          FFmpeg Processing Note
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
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
