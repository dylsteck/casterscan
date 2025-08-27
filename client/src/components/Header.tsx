import { Search } from "./Search";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header>
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
          <a href="/">
            <span className="font-medium text-lg">CASTERSCAN</span> 
          </a>
          </div>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-mr-1" />
          </div>
        </div>
      </div>
      <Search />
    </header>
  );
}
