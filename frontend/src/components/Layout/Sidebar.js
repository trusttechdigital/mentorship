import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  Receipt, 
  DollarSign, 
  Package,
  Briefcase
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Staff Profiles',
      href: '/staff',
      icon: Users,
      current: location.pathname === '/staff'
    },
    {
      name: 'Mentee Directory',
      href: '/mentees',
      icon: GraduationCap,
      current: location.pathname === '/mentees'
    },
    {
      name: 'Shared Documents',
      href: '/documents',
      icon: FileText,
      current: location.pathname === '/documents'
    },
    {
      name: 'Receipt Filing',
      href: '/receipts',
      icon: Receipt,
      current: location.pathname === '/receipts'
    },
    {
      name: 'Invoice Tracking',
      href: '/invoices',
      icon: DollarSign,
      current: location.pathname === '/invoices'
    },
    {
      name: 'Stock Management',
      href: '/stock',
      icon: Package,
      current: location.pathname === '/stock'
    }
  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo section */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Mentorship Portal
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
              >
                <Icon
                  className={`${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-5 w-5`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">Admin Portal</p>
              <p className="text-sm text-gray-500">Version 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;