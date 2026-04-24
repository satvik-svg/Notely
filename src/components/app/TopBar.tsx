import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
        <input 
          type="text" 
          placeholder="Search notes, groups..." 
          className="w-full bg-secondary text-foreground text-sm font-body rounded-xl pl-10 pr-4 py-2 outline-none border border-transparent focus:border-ring focus:bg-background transition-all"
        />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative text-muted-foreground/80 hover:text-foreground/80 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-brand-500 rounded-full border border-background"></span>
        </button>
      </div>
    </header>
  );
}
