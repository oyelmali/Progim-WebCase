import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-6 flex justify-center">
      <ul className="inline-flex items-center space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`w-10 h-10 rounded-full font-medium transition-all duration-300 ${
                currentPage === number
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-110'
                  : 'bg-white/80 text-gray-600 hover:bg-purple-100 hover:text-purple-700 border border-purple-200'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;