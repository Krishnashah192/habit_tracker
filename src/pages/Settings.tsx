import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { CreditCard, Shield, Download, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { habits, habitLogs } = useHabits();
  const [exportLoading, setExportLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleExportData = () => {
    setExportLoading(true);
    
    try {
      const data = {
        user,
        profile,
        habits,
        habitLogs,
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `habithero-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/subscription');
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await updateProfile({
          subscription_tier: 'free',
          subscription_status: 'inactive'
        });
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  const isProMember = profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="input bg-gray-50">{user?.email}</div>
          </div>
          
          <div>
            <label className="label">Subscription Status</label>
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isProMember ? 'text-primary-600' : 'text-gray-600'}`} />
              <span className="capitalize">{isProMember ? 'Pro' : 'Free'}</span>
              {isProMember && (
                <span className="ml-2 bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Subscription</h2>
        
        {!isProMember ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
              <h3 className="font-medium text-primary-900">Upgrade to Pro</h3>
              <p className="text-primary-700 text-sm mt-1">
                Get access to advanced analytics, unlimited habits, and more
              </p>
              <ul className="mt-3 space-y-2 text-sm text-primary-700">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Unlimited habits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <button 
                onClick={handleUpgradeClick}
                className="btn btn-primary mt-4"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-900">Pro Subscription Active</h3>
              <p className="text-green-700 text-sm mt-1">
                You have access to all premium features
              </p>
            </div>
            <button 
              onClick={handleCancelSubscription}
              className="btn btn-outline text-red-600 hover:bg-red-50"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <div>
            <p className="mb-2">Export all your habits and tracking data</p>
            <button 
              onClick={handleExportData}
              className="btn btn-outline flex items-center gap-2"
              disabled={exportLoading}
            >
              <Download className="w-5 h-5" />
              <span>{exportLoading ? 'Exporting...' : 'Export Data'}</span>
            </button>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <p className="text-red-600 font-medium flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Danger Zone</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              These actions cannot be undone.
            </p>
            <button className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
              Delete Account
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium mb-4">About</h2>
        
        <div className="space-y-2">
          <p>1percentRise</p>
          <p className="text-sm text-gray-600">Version 0.1.0</p>
          <p className="text-sm text-gray-600">
            Track your habits, achieve your goals
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;