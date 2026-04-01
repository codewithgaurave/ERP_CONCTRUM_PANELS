// src/utils/paginationHelpers.js
export const calculatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else if (currentPage <= 3) {
    for (let i = 1; i <= maxVisible; i++) {
      pages.push(i);
    }
  } else if (currentPage >= totalPages - 2) {
    for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      pages.push(i);
    }
  }
  
  return pages;
};