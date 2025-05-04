
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Edit, AlertTriangle } from "lucide-react";

interface ScriptEditorProps {
  onScriptChange: (script: string) => void;
  onProcessVideo: () => void;
  isProcessing: boolean;
  isCompatible?: boolean | null;
}

const ScriptEditor = ({ onScriptChange, onProcessVideo, isProcessing, isCompatible }: ScriptEditorProps) => {
  const [script, setScript] = useState<string>(
    "# Example FFmpeg command\n-i input.mp4 -vf \"scale=1280:720,setsar=1:1\" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4"
  );
  const { toast } = useToast();

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScript(e.target.value);
    onScriptChange(e.target.value);
  };

  const handleApplyTemplate = (template: string) => {
    setScript(template);
    onScriptChange(template);
    toast({
      title: "Template Applied",
      description: "FFmpeg script template has been applied.",
    });
  };

  const lineNumbers = script.split('\n').map((_, i) => i + 1).join('\n');
  const isButtonDisabled = isProcessing || isCompatible === false;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-primary" />
          FFmpeg Script
        </CardTitle>
        <CardDescription>
          Enter your FFmpeg script to process the uploaded media
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="editor-container bg-editor-bg rounded-md overflow-hidden">
          <div className="flex">
            <div className="line-numbers py-2 px-3 bg-editor-bg/50 select-none">
              {lineNumbers}
            </div>
            <textarea
              value={script}
              onChange={handleScriptChange}
              className="w-full bg-editor-bg text-editor-text p-2 outline-none resize-none min-h-[180px] font-mono"
              placeholder="Enter your FFmpeg script here..."
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApplyTemplate("# Basic Video Conversion\n-i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4")}
          >
            Basic Video
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApplyTemplate("# Image Sequence to Video\n-framerate 30 -i image%d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4")}
          >
            Images to Video
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApplyTemplate("# Add Fade In/Out\n-i input.mp4 -vf \"fade=in:0:30,fade=out:300:30\" -c:a copy output.mp4")}
          >
            Fade Effects
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onProcessVideo} 
          className="w-full" 
          disabled={isButtonDisabled}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">◌</span>
              Processing...
            </>
          ) : isCompatible === false ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Browser Not Compatible
            </>
          ) : (
            <>Process Video</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScriptEditor;
