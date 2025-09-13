// frontend/src/pages/Settings/Settings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Save, Lock, Smartphone, Trash2 } from 'lucide-react';
import PasswordChangeModal from '../../components/UI/PasswordChangeModal';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
    timezone: 'Caribbean/Barbados'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [debugClicks, setDebugClicks] = useState([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Debug function to track clicks
  const logClick = (buttonName) => {
    const clickEvent = `${new Date().toLocaleTimeString()}: ${buttonName} clicked`;
    console.log(clickEvent);
    setDebugClicks(prev => [...prev.slice(-4), clickEvent]); // Keep last 5 clicks
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
        console.log('Loaded settings from localStorage:', parsedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key, value) => {
    console.log('Setting changed:', key, '=', value);
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    logClick('Save Settings');
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('userSettings', JSON.stringify(settings));
      console.log('Settings saved:', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Updated debug handlers - Change Password now opens the modal
  const handleChangePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logClick('Change Password');
    console.log('Change Password handler called - opening modal');
    setIsPasswordModalOpen(true);
  };

  const handleTwoFactorAuth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logClick('Two-Factor Auth');
    console.log('Two-Factor Auth handler called');
    toast.success('📱 Two-Factor Auth clicked! (Debug mode)', {
      duration: 3000,
    });
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logClick('Delete Account');
    console.log('Delete Account handler called');
    toast.success('🗑️ Delete Account clicked! (Debug mode)', {
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your application preferences</p>
      </div>

      {/* Debug Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800">Debug Information:</h3>
        <div className="text-sm text-yellow-700 mt-2">
          <p><strong>Recent Button Clicks:</strong></p>
          {debugClicks.length > 0 ? (
            <ul className="list-disc list-inside mt-1">
              {debugClicks.map((click, index) => (
                <li key={index}>{click}</li>
              ))}
            </ul>
          ) : (
            <p className="italic">No buttons clicked yet</p>
          )}
          <p className="mt-2"><strong>Check browser console for detailed logs</strong></p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notifications Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <div className="relative">
                <div 
                  onClick={() => {
                    logClick('Email Notifications Toggle');
                    handleSettingChange('emailNotifications', !settings.emailNotifications);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    } translate-y-0.5`}
                  />
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Push Notifications</span>
              <div className="relative">
                <div 
                  onClick={() => {
                    logClick('Push Notifications Toggle');
                    handleSettingChange('pushNotifications', !settings.pushNotifications);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                    settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    } translate-y-0.5`}
                  />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Dark Mode</span>
              <div className="relative">
                <div 
                  onClick={() => {
                    logClick('Dark Mode Toggle');
                    handleSettingChange('darkMode', !settings.darkMode);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    } translate-y-0.5`}
                  />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Regional Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => {
                  logClick('Language Change');
                  handleSettingChange('language', e.target.value);
                }}
                className="input-field cursor-pointer hover:border-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => {
                  logClick('Timezone Change');
                  handleSettingChange('timezone', e.target.value);
                }}
                className="input-field cursor-pointer hover:border-blue-500 focus:border-blue-500"
              >
                <option value="Caribbean/Barbados">Caribbean Standard Time</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>
          
          <div className="space-y-3">
            {/* METHOD 1: Change Password - Now opens actual modal */}
            <button 
              onClick={handleChangePassword}
              className="w-full flex items-center justify-start px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
            >
              <Lock className="w-4 h-4 mr-3 text-gray-500" />
              Change Password (Opens Modal)
            </button>
            
            {/* METHOD 2: Button with onMouseDown for immediate response */}
            <button 
              onMouseDown={handleTwoFactorAuth}
              className="w-full flex items-center justify-start px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 mr-3 text-gray-500" />
              Two-Factor Authentication (Method 2)
            </button>
            
            {/* METHOD 3: Div with onClick for testing */}
            <div 
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-start px-4 py-3 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors border border-red-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-3 text-red-500" />
              Delete Account (Method 3)
            </div>

            {/* METHOD 4: Direct inline handler */}
            <button 
              onClick={() => {
                logClick('Test Button');
                console.log('Test button clicked directly!');
                toast.success('✅ Test button works!');
              }}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Test Button (Should Always Work)
            </button>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`btn-primary flex items-center ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Settings;