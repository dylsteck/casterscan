import { SettingsDialog } from "./ResponsiveDialog";
import { Search } from "./Search";

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
          <nav className="flex items-center gap-6 text-sm">
            <a href="https://github.com/dylsteck/casterscan" className="hover:underline" target="_blank">GITHUB</a>
            <SettingsDialog>
              <span className="hover:underline cursor-pointer">SETTINGS</span>
            </SettingsDialog>
          </nav>
        </div>
      </div>
      <Search />
    </header>
  );
}
