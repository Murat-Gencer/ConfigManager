import React from 'react';

const PageHeader = ({ title, badge, onAction, actionText, actionIcon = 'add' }) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-[#233648] bg-white dark:bg-background-dark/50 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">{title}</h1>
        {badge && (
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
            {badge}
          </span>
        )}
      </div>
      {onAction && actionText && (
        <div className="flex items-center gap-4">
          <button
            onClick={onAction}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">{actionIcon}</span>
            {actionText}
          </button>
        </div>
      )}
    </header>
  );
};

export default PageHeader;