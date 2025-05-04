
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
          This is a frontend demonstration of a video processing application. In a complete implementation:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Video processing would be handled using FFmpeg.wasm for in-browser processing</li>
          <li>Alternatively, a server-side implementation could be used for more complex operations</li>
          <li>Real-time preview would be generated for immediate feedback</li>
          <li>Progress tracking would show detailed encoding status</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default FFmpegNote;
