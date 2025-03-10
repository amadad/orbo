/**
 * date-fix.js
 * Utilities to handle ISO 8601 date parsing in browsers.
 * Specifically handles the format with +00:00 timezone which some browsers have trouble with.
 */

// Helper function to safely parse ISO dates
function safeParseDate(dateStr) {
  if (!dateStr) return null;
  try {
    // Handle ISO 8601 format by replacing +00:00 with Z
    const fixedTimestamp = dateStr.toString().replace(/(\+00:00)$/, 'Z');
    const date = new Date(fixedTimestamp);
    if (isNaN(date.getTime())) {
      console.error('Invalid date after parsing:', dateStr);
      return null;
    }
    return date;
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
    return null;
  }
}

// Format a timestamp for display in the UI
function formatTimestamp(timestamp) {
  if (!timestamp) return 'No Date';
  
  // Try extra processing for format problems
  try {
    // Handle standard ISO format
    const date = safeParseDate(timestamp);
    if (date) {
      return date.toLocaleString();
    }
    
    // Try alternate approaches if standard parsing fails
    if (typeof timestamp === 'string') {
      // For YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
        const [year, month, day] = timestamp.split('-');
        return new Date(year, month-1, day).toLocaleString();
      }
      
      // For string dates with timezone info
      if (timestamp.includes('+') || timestamp.includes('Z')) {
        const cleanTimestamp = timestamp.replace(/(\+\d{2}:\d{2})$/, 'Z');
        const date = new Date(cleanTimestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      }
    }
  } catch (e) {
    console.error('Error in formatTimestamp:', e);
  }
  
  return 'Invalid Date';
}

// Patch the Chart.js time scale to handle our ISO 8601 dates
function patchChartJsDateParsing() {
  if (typeof Chart !== 'undefined' && Chart.adapters && Chart.adapters._date) {
    const originalParse = Chart.adapters._date.parse;
    
    Chart.adapters._date.parse = function(value) {
      if (typeof value === 'string' && value.includes('+00:00')) {
        value = value.replace(/(\+00:00)$/, 'Z');
      }
      return originalParse.call(this, value);
    };
    
    console.log('Chart.js date parsing patched for ISO 8601 compatibility');
  }
}

// Call this when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  patchChartJsDateParsing();
});
