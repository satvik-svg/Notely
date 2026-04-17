import { Search, Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search notes, groups..." 
          className="w-full bg-slate-50 text-sm font-body rounded-xl pl-10 pr-4 py-2 outline-none border border-transparent focus:border-brand-200 focus:bg-white transition-all"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-brand-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
