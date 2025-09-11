import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  Users,
  BookOpen,
  FileText,
  DollarSign,
  Package,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data for search
  const searchableData = [
    // Staff
    { type: 'staff', name: 'Test Admin', path: '/staff', description: 'Administrator' },
    { type: 'staff', name: 'John Mentor', path: '/staff', description: 'Senior Mentor' },
    { type: 'staff', name: 'Sarah Coordinator', path: '/staff', description: 'Program Coordinator' },
    
    // Mentees
    { type: 'mentee', name: 'Jane Student', path: '/mentees', description: 'Active Program Participant' },
    { type: 'mentee', name: 'Bob Learner', path: '/mentees', description: 'Technology Track' },
    { type: 'mentee', name: 'Alice Growth', path: '/mentees', description: 'Leadership Program' },
    
    // Documents
    { type: 'document', name: 'Weekly Plan Template', path: '/documents', description: 'Template for weekly planning' },
    { type: 'document', name: 'Training Materials Q3', path: '/documents', description: 'Q3 training resources' },
    { type: 'document', name: 'Program Guidelines 2024', path: '/documents', description: 'Updated program policies' },
    
    // Invoices
    { type: 'invoice', name: 'Office Supply Co.', path: '/invoices', description: 'Invoice INV-001' },
    { type: 'invoice', name: 'Tech Solutions Ltd', path: '/invoices', description: 'Software licensing' },
    { type: 'invoice', name: 'Maintenance Services', path: '/invoices', description: 'Building maintenance' },
    
    // Inventory
    { type: 'inventory', name: 'Office Supplies Kit', path: '/stock', description: 'Office category - 25 units' },
    { type: 'inventory', name: 'Training Materials Set', path: '/stock', description: 'Training category - Low stock' },
    { type: 'inventory', name: 'Computer Equipment', path: '/stock', description: 'Technology - 12 units' },
    
    // Receipts
    { type: 'receipt', name: 'Office Depot Receipt', path: '/receipts', description: 'Approved - $125.50' },
    { type: 'receipt', name: 'Restaurant Receipt', path: '/receipts', description: 'Pending - $89.75' },
    { type: 'receipt', name: 'Gas Station Receipt', path: '/receipts', description: 'Travel - $45.20' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = searchableData.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Limit to 8 results

    setSearchResults(results);
    setShowSearchResults(results.length > 0);

    if (results.length === 0) {
      toast.error(`No results found for "${query}"`);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Real-time search as user types
    if (value.length > 2) {
      performSearch(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (result) => {
    navigate(result.path);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    toast.success(`Navigating to ${result.name}`);
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case 'staff': return <Users className="w-4 h-4" />;
      case 'mentee': return <BookOpen className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'invoice': return <DollarSign className="w-4 h-4" />;
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'receipt': return <Receipt className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getSearchTypeColor = (type) => {
    switch (type) {
      case 'staff': return 'text-blue-600 bg-blue-50';
      case 'mentee': return 'text-purple-600 bg-purple-50';
      case 'document': return 'text-green-600 bg-green-50';
      case 'invoice': return 'text-yellow-600 bg-yellow-50';
      case 'inventory': return 'text-red-600 bg-red-50';
      case 'receipt': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Simple navigation items for admin
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Staff Profiles', href: '/staff', icon: 'users' },
    { name: 'Mentee Directory', href: '/mentees', icon: 'graduation-cap' },
    { name: 'Documents', href: '/documents', icon: 'file-text' },
    { name: 'Receipts', href: '/receipts', icon: 'receipt' },
    { name: 'Invoices', href: '/invoices', icon: 'dollar-sign' },
    { name: 'Stock Management', href: '/stock', icon: 'package' }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
              <h1 className="text-xl font-bold text-gray-900">
                Mentorship Portal
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff, mentees, documents, invoices..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding results to allow clicking on them
                  setTimeout(() => setShowSearchResults(false), 200);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-2 py-1 mb-1">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <div className={`p-1 rounded ${getSearchTypeColor(result.type)}`}>
                          {getSearchIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {result.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">
                          {result.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Settings */}
            <button 
              onClick={() => toast.info('Settings feature coming soon')}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <Settings className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      toast.info('Settings feature coming soon');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath(item.href)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;