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
  BookOpen
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
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo section - Now with HYPE logo at top left */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
        <div className="flex items-center space-x-3 w-full">
          {/* HYPE Logo - moved here from header */}
          <img 
            src="/images/HYPE-logo.png" 
            alt="HYPE - Harnesssing Young Potential Excellence" 
            className="w-10 h-10 flex-shrink-0"
          />
          
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Mentorship Portal
            </h1>
            <p className="text-xs text-teal-600 font-medium">HYPE Program</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-grow pt-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'bg-teal-50 border-r-4 border-teal-600 text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-all duration-150 ease-in-out`}
              >
                <Icon
                  className={`${
                    item.current ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-500'
                  } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer with HYPE branding */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center mr-3">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">Admin Portal</p>
              <p className="text-xs text-teal-600">Version 1.0</p>
            </div>
          </div>
          
          {/* HYPE branding */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700">Harnesssing Young Potential Excellence</p>
            <p className="text-xs text-gray-400">
              Portal built by{' '}
              <a 
                href="https://trusttechdigital.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                TrustTech Digital
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;