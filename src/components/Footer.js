import { React } from "react";

const Footer = () => {
  return (
    <footer className="h-10 border-t border-gray-200 dark:border-[#233648] px-8 flex items-center justify-between text-[10px] font-medium text-gray-500 uppercase tracking-widest bg-white dark:bg-background-dark/50">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          System Sync: Stable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">lock</span>
          Encryption: AES-256
        </span>
      </div>
      <div>v1.0.0-stable © 2024 Config Vault</div>
    </footer>
  );
};

export default Footer;
