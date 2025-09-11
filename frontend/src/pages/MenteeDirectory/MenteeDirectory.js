import React, { useState } from 'react';
import { Users, Search, GraduationCap, User } from 'lucide-react';

const MenteeDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simple mock mentee data
  const mockMentees = [
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Student',
      email: 'jane.student@mentorship.com',
      status: 'active',
      mentor: 'John Mentor',
      joinDate: '2024-02-15',
      program: 'Business Development'
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Learner',
      email: 'bob.learner@mentorship.com',
      status: 'active',
      mentor: 'Sarah Coordinator',
      joinDate: '2024-03-01',
      program: 'Technology Track'
    },
    {
      id: '3',
      firstName: 'Alice',
      lastName: 'Growth',
      email: 'alice.growth@mentorship.com',
      status: 'active',
      mentor: 'John Mentor',
      joinDate: '2024-01-20',
      program: 'Leadership Program'
    }
  ];

  // Filter mentees based on search
  const filteredMentees = mockMentees.filter(mentee =>
    mentee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentee Directory</h1>
          <p className="text-gray-600">Manage mentee profiles and assignments</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
          <GraduationCap className="w-4 h-4 mr-2" />
          Add Mentee
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search mentees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
          <div className="flex items-center">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Mentees</p>
              <p className="text-xl font-bold text-blue-900">{filteredMentees.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-xl font-bold text-green-900">{filteredMentees.filter(m => m.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-lg">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Programs</p>
              <p className="text-xl font-bold text-purple-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mentee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentees.map((mentee) => (
          <div key={mentee.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {mentee.firstName[0]}{mentee.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {mentee.firstName} {mentee.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{mentee.email}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <GraduationCap className="w-3 h-3 mr-1" />
                Mentee
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium capitalize">{mentee.status}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mentor:</span>
                <span className="font-medium">{mentee.mentor}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Program:</span>
                <span className="font-medium">{mentee.program}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium">{mentee.joinDate}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                View Profile
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMentees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm 
            ? "No mentees found matching your search."
            : "No mentees registered yet."
          }
        </div>
      )}
    </div>
  );
};

export default MenteeDirectory;