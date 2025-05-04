
import { Film, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const { toast } = useToast();
  
  const handleHelpClick = () => {
    toast({
      title: "Help & Documentation",
      description: "Upload media files, write FFmpeg scripts, and process your video. Download when complete.",
    });
  };

  return (
    <header className="border-b border-border py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tighter">
            ClipCraft<span className="text-primary">Animator</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleHelpClick}>
            Help
          </Button>
          <Button variant="outline" size="sm">
            <Scissors className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
