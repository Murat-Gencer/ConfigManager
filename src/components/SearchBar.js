import React from 'react';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative w-full max-w-md">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
        search
      </span>
      <input
        className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg pl-10 pr-10 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-gray-500"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
      />
      {value && (
        <button
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;