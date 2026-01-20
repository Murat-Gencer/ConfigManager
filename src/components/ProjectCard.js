import React from 'react';

const ProjectCard = ({ project, searchQuery, onEdit, onClick }) => {
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-500/30 text-gray-900 dark:text-white rounded px-1">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined text-primary">folder</span>
        </div>
        <div>
          <h4 className="font-bold text-sm">{highlightText(project.name, searchQuery)}</h4>
          <p className="text-xs text-gray-500">
            {highlightText(project.description, searchQuery) || 'No description'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-400">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <button
          className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-primary transition-colors"
          onClick={onEdit}
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;