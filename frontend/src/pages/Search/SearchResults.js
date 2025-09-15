import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  const { data: searchData, isLoading } = useQuery(
    ['search', query],
    () => apiClient.get(`/search?q=${query}`),
    { enabled: !!query }
  );

  const results = searchData?.results || [];

  const getResultLink = (result) => {
    switch (result.type) {
      case 'staff': return `/staff/${result.id}`;
      case 'mentee': return `/mentees/${result.id}`;
      case 'invoice': return `/invoices`;
      case 'receipt': return `/receipts`;
      default: return '#';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600">Showing results for: "{query}"</p>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-cell text-left">Type</th>
                <th className="th-cell text-left">Summary</th>
                <th className="th-cell text-left">Date</th>
                <th className="th-cell text-right">Amount</th>
                <th className="th-cell"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={`${result.type}-${result.id}`} className="hover:bg-gray-50">
                  <td className="td-cell font-medium capitalize">{result.type}</td>
                  <td className="td-cell">{result.summary}</td>
                  <td className="td-cell">{result.date ? formatDate(result.date) : 'N/A'}</td>
                  <td className="td-cell text-right">{result.amount ? formatCurrency(result.amount) : 'N/A'}</td>
                  <td className="td-cell text-right">
                    <Link to={getResultLink(result)} className="btn-secondary btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-800">No Results Found</h3>
          <p className="text-gray-600">We couldn't find anything matching your search. Try a different term.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
