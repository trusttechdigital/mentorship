import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, FileText, DollarSign, Package, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard stats from backend
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard-stats',
    () => apiClient.get('/dashboard/stats'),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-blue-100">
            Loading your dashboard data...
          </p>
        </div>
        <LoadingSpinner size="large" className="py-12" />
      </div>
    );
  }

  // Error state - backend not available
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-blue-100">
            Welcome to your mentorship portal dashboard.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Backend Connection Required:</strong> Unable to load dashboard statistics. 
                Please ensure your backend server is running and accessible.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Expected endpoint: <code>/api/dashboard/stats</code>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mock Data</h3>
          <p className="text-gray-600 mb-4">
            This dashboard displays real data from your backend API only.
            Start your backend server to see live statistics.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Expected data: Active staff, mentees, documents, invoices, and inventory</p>
            <p>API Health Check: <code>GET /api/health</code></p>
          </div>
        </div>

        {/* Quick Actions - Even when backend is down */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/staff')}
              className="flex items-center justify-start px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Staff
            </button>
            <button 
              onClick={() => navigate('/mentees')}
              className="flex items-center justify-start px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Manage Mentees
            </button>
            <button 
              onClick={() => navigate('/invoices')}
              className="flex items-center justify-start px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Review Invoices
            </button>
            <button 
              onClick={() => navigate('/stock')}
              className="flex items-center justify-start px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Package className="w-4 h-4 mr-2" />
              Check Inventory
            </button>
            <button 
              onClick={() => navigate('/documents')}
              className="flex items-center justify-start px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Documents
            </button>
            <button 
              onClick={() => navigate('/receipts')}
              className="flex items-center justify-start px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Clock className="w-4 h-4 mr-2" />
              Manage Receipts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render with real backend data
  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentActivity || {};

  const dashboardCards = [
    {
      title: 'Staff Members',
      value: stats.totalStaff || 0,
      description: 'Active mentors & admins',
      icon: Users,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Mentees',
      value: stats.totalMentees || 0,
      description: 'Enrolled students',
      icon: BookOpen,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Shared Documents',
      value: stats.totalDocuments || 0,
      description: 'Available resources',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices || 0,
      description: 'Awaiting payment',
      icon: DollarSign,
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems || 0,
      description: 'Need restocking',
      icon: Package,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600'
    },
    {
      title: 'Pending Receipts',
      value: stats.pendingReceipts || 0,
      description: 'Awaiting review',
      icon: Clock,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Welcome to your mentorship portal dashboard.
        </p>
        <div className="mt-2 text-sm text-blue-200">
          <TrendingUp className="inline w-4 h-4 mr-1" />
          Live data from your backend system
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <div key={index} className={`p-6 bg-white rounded-lg border-2 ${card.color}`}>
            <div className="flex items-center">
              <card.icon className={`w-8 h-8 ${card.iconColor}`} />
              <div className="ml-3">
                <p className={`text-sm font-medium ${card.iconColor}`}>
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/staff')}
            className="flex items-center justify-start px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Staff
          </button>
          <button 
            onClick={() => navigate('/mentees')}
            className="flex items-center justify-start px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Manage Mentees
          </button>
          <button 
            onClick={() => navigate('/invoices')}
            className="flex items-center justify-start px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Review Invoices
          </button>
          <button 
            onClick={() => navigate('/stock')}
            className="flex items-center justify-start px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Package className="w-4 h-4 mr-2" />
            Check Inventory
          </button>
          <button 
            onClick={() => navigate('/documents')}
            className="flex items-center justify-start px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Documents
          </button>
          <button 
            onClick={() => navigate('/receipts')}
            className="flex items-center justify-start px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Clock className="w-4 h-4 mr-2" />
            Manage Receipts
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {/* Show loading state for activity */}
        {(!recentActivity.newMentees && !recentActivity.newDocuments && !recentActivity.pendingInvoices) ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Loading recent activity...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Recent Mentees */}
            {recentActivity.newMentees?.map((mentee, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-900">
                  New mentee: {mentee.firstName} {mentee.lastName}
                </span>
                <span className="text-gray-400">
                  • {mentee.mentor?.firstName} {mentee.mentor?.lastName}
                </span>
              </div>
            ))}

            {/* Recent Documents */}
            {recentActivity.newDocuments?.map((doc, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-900">
                  Document uploaded: {doc.title}
                </span>
              </div>
            ))}

            {/* Pending Invoices */}
            {recentActivity.pendingInvoices?.map((invoice, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-900">
                  Pending invoice: {invoice.vendor} - ${parseFloat(invoice.amount).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Show message if no activity */}
            {(!recentActivity.newMentees?.length && !recentActivity.newDocuments?.length && !recentActivity.pendingInvoices?.length) && (
              <div className="text-center py-4 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No recent activity to display</p>
                <p className="text-sm">Activity will appear here as users interact with the system</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;