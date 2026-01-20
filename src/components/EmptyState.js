import React from 'react';

const EmptyState = ({ 
  icon = 'folder_off', 
  title, 
  description, 
  buttonText, 
  onButtonClick,
  buttonIcon = 'add'
}) => {
  return (
    <div className="glass-card rounded-xl p-12 text-center">
      <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
        {icon}
      </span>
      <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {description}
      </p>
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all"
        >
          <span className="material-symbols-outlined text-sm">{buttonIcon}</span>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;