// Safe currency formatting function with fallback
export const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  
  // Check if the amount is a valid number
  if (isNaN(numAmount)) {
    return 'EC$0.00';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XCD', // Eastern Caribbean Dollar
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    return `EC$${numAmount.toFixed(2)}`;
  }
};

// Alternative simple currency formatter
export const formatCurrencySimple = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return 'EC$0.00';
  }
  return `EC$${numAmount.toFixed(2)}`;
};

// Caribbean date format: dd/mm/yyyy
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  } catch (error) {
    return 'N/A';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return 'N/A';
  }
};

// Convert date to input format (yyyy-mm-dd) for HTML date inputs
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Convert input date (yyyy-mm-dd) to Caribbean display format (dd/mm/yyyy)
export const formatInputDateToDisplay = (inputDate) => {
  if (!inputDate) return '';
  
  try {
    const [year, month, day] = inputDate.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return '';
  } catch (error) {
    return '';
  }
};

// Convert Caribbean format (dd/mm/yyyy) to input format (yyyy-mm-dd)
export const formatDisplayDateToInput = (displayDate) => {
  if (!displayDate) return '';
  
  try {
    const [day, month, year] = displayDate.split('/');
    if (year && month && day) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  } catch (error) {
    return '';
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validate and format numeric values
export const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
};

// Safe parsing of numeric values
export const parseNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};