import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, FileText, DollarSign, Package } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dashboardCards = [
    {
      title: 'Staff Members',
      value: '8',
      description: 'Active mentors & admins',
      icon: Users,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Mentees',
      value: '24',
      description: 'Enrolled students',
      icon: BookOpen,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Shared Documents',
      value: '12',
      description: 'Available resources',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Pending Invoices',
      value: '5',
      description: 'Awaiting payment',
      icon: DollarSign,
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Stock Items',
      value: '156',
      description: 'Inventory tracked',
      icon: Package,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600'
    }
  ];

  // Quick action handlers
  const handleManageStaff = () => {
    navigate('/staff');
  };

  const handleReviewInvoices = () => {
    navigate('/invoices');
  };

  const handleCheckInventory = () => {
    navigate('/stock');
  };

  const handleManageMentees = () => {
    navigate('/mentees');
  };

  const handleViewDocuments = () => {
    navigate('/documents');
  };

  const handleManageReceipts = () => {
    navigate('/receipts');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Welcome to your mentorship portal dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <div key={index} className={`p-6 bg-white rounded-lg border-2 ${card.color} hover:shadow-lg transition-shadow cursor-pointer`}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleManageStaff}
            className="flex items-center justify-start px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Users className="w-5 h-5 mr-3" />
            <span className="font-medium">Manage Staff</span>
          </button>
          
          <button 
            onClick={handleManageMentees}
            className="flex items-center justify-start px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            <span className="font-medium">Manage Mentees</span>
          </button>
          
          <button 
            onClick={handleReviewInvoices}
            className="flex items-center justify-start px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors shadow-sm"
          >
            <DollarSign className="w-5 h-5 mr-3" />
            <span className="font-medium">Review Invoices</span>
          </button>
          
          <button 
            onClick={handleCheckInventory}
            className="flex items-center justify-start px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            <Package className="w-5 h-5 mr-3" />
            <span className="font-medium">Check Inventory</span>
          </button>
          
          <button 
            onClick={handleViewDocuments}
            className="flex items-center justify-start px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <FileText className="w-5 h-5 mr-3" />
            <span className="font-medium">View Documents</span>
          </button>
          
          <button 
            onClick={handleManageReceipts}
            className="flex items-center justify-start px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            <Package className="w-5 h-5 mr-3" />
            <span className="font-medium">Manage Receipts</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">System backup completed</span>
            <span className="text-gray-400">• 2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">New invoice created by Test Admin</span>
            <span className="text-gray-400">• 4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Document uploaded to shared folder</span>
            <span className="text-gray-400">• 1 day ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Invoice payment received</span>
            <span className="text-gray-400">• 3 days ago</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-green-800">All Systems Operational</p>
            <p className="text-xs text-green-600">Last checked: Just now</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-800">Database Connected</p>
            <p className="text-xs text-blue-600">Response time: 45ms</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-800">Active Users</p>
            <p className="text-xs text-purple-600">Currently: 1 admin online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;