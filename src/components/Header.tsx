
import { Film, Scissors, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const handleHelpClick = () => {
    toast({
      title: "Help & Documentation",
      description: "Upload media files, write FFmpeg scripts, and process your video. Download when complete.",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
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
          {user && (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
