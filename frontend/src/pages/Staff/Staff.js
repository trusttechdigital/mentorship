import React, { useState } from 'react';
import { Users, Shield, UserCheck, Search } from 'lucide-react';

const StaffProfiles = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simple mock staff data for admin-only system
  const mockStaffMembers = [
    {
      id: '1',
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@mentorship.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Mentor',
      email: 'john.mentor@mentorship.com',
      role: 'mentor',
      status: 'active',
      joinDate: '2024-02-20',
      assignedMentees: 3
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Coordinator',
      email: 'sarah.coord@mentorship.com',
      role: 'mentor',
      status: 'active',
      joinDate: '2024-03-10',
      assignedMentees: 2
    }
  ];

  // Filter staff based on search
  const filteredStaff = mockStaffMembers.filter(staff =>
    staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'mentor':
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      mentor: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Profiles</h1>
          <p className="text-gray-600">Manage administrators and mentors</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {getRoleIcon(staff.role)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {staff.firstName} {staff.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{staff.email}</p>
                </div>
              </div>
              {getRoleBadge(staff.role)}
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium capitalize">{staff.status}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium">{staff.joinDate}</span>
              </div>
              
              {staff.role === 'mentor' && staff.assignedMentees && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assigned Mentees:</span>
                  <span className="font-medium">{staff.assignedMentees}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Edit
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-red-600 rounded hover:bg-red-50">
                Disable
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No staff members found matching your search.
        </div>
      )}
    </div>
  );
};

export default StaffProfiles;