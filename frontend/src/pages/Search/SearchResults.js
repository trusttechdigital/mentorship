import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api'; // Corrected import
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  const { data: searchData, isLoading } = useQuery(
    ['search', query],
    () => api.get(`/search?q=${query}`), // Corrected usage
    { enabled: !!query }
  );

  const rawResults = searchData || [];

  const getResultLink = (result) => {
    switch (result.type) {
      case 'staff': return `/staff/${result.id}`;
      case 'mentee': return `/mentees/${result.id}`;
      case 'document': return `/documents/${result.id}`;
      case 'invoice': return `/invoices/${result.id}`;
      case 'receipt': return `/receipts/${result.id}`;
      case 'inventory': return `/inventory/${result.id}`;
      default: return '#';
    }
  };

  const formatResultsForDisplay = (results) => {
    if (!Array.isArray(results)) {
      return [];
    }
    return results.map(result => {
      const formatted = { ...result };
      switch (result.type) {
        case 'mentee':
          formatted.summary = `${result.firstName} ${result.lastName} (${result.hypeId})`;
          formatted.date = result.programStartDate;
          break;
        case 'staff':
          formatted.summary = `${result.firstName} ${result.lastName}`;
          formatted.date = result.hireDate;
          break;
        case 'document':
          formatted.summary = result.title;
          formatted.date = result.createdAt;
          break;
        case 'invoice':
          formatted.summary = `Invoice #${result.invoiceNumber} from ${result.vendor}`;
          formatted.amount = result.total;
          formatted.date = result.issueDate;
          break;
        case 'receipt':
          formatted.summary = `Receipt #${result.receiptNumber} from ${result.vendor}`;
          formatted.amount = result.total;
          formatted.date = result.date;
          break;
        case 'inventory':
          formatted.summary = `${result.itemName} (SKU: ${result.sku})`;
          formatted.details = `Qty: ${result.quantity}`;
          break;
        default:
          formatted.summary = 'Unknown result type';
      }
      return formatted;
    });
  };

  const results = formatResultsForDisplay(rawResults);

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        {query && <p className="text-lg text-gray-600 mt-1">Showing results for: "{query}"</p>}
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <Link to={getResultLink(result)} key={`${result.type}-${result.id}`} className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">{result.type}</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{result.summary}</p>
                     {result.details && <p className="text-md text-gray-600 mt-1">{result.details}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    {result.date && (
                      <p className="text-sm text-gray-500">{formatDate(result.date)}</p>
                    )}
                    {result.amount && (
                       <p className="text-lg font-semibold text-gray-700 mt-1">{formatCurrency(result.amount)}</p>
                    )}
                     <span className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">View Details &rarr;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto h-16 w-16 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">No Results Found</h3>
            <p className="text-gray-600 mt-2">We couldn't find anything matching your search. Please try a different term.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
