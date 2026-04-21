import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar() {
  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
        <input 
          type="text" 
          placeholder="Search notes, groups..." 
          className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-body rounded-xl pl-10 pr-4 py-2 outline-none border border-transparent focus:border-brand-200 dark:focus:border-brand-700 focus:bg-white dark:focus:bg-slate-950 transition-all"
        />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-brand-500 rounded-full border border-white dark:border-slate-950"></span>
        </button>
      </div>
    </header>
  );
}
