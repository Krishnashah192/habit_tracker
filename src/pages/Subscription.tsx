import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

const features = {
  free: [
    'Up to 5 habits',
    'Basic analytics',
    'Daily tracking',
    'Email support'
  ],
  pro: [
    'Unlimited habits',
    'Advanced analytics',
    'Custom categories',
    'Priority support',
    'Data export',
    'Progress insights',
    'Habit streaks',
    'Custom reminders'
  ]
};

const Subscription: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  React.useEffect(() => {
    loadRazorpay();
  }, []);

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Update subscription status in the database
      await updateProfile({
        subscription_tier: 'pro',
        subscription_status: 'active'
      });

      // Navigate to settings page
      navigate('/settings');
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      const options = {
        key: "rzp_test_atLNvmxtjdgijr",
        amount: "99900", // ₹999 in paise
        currency: "INR",
        name: "1percentrise",
        description: "Pro Subscription",
        image: "https://example.com/your_logo.png",
        handler: handlePaymentSuccess,
        prefill: {
          email: profile?.username || '',
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-gray-600">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="card border-2 border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Free Plan</h2>
            <p className="text-gray-600 mt-2">Perfect for getting started</p>
            
            <div className="mt-4">
              <span className="text-3xl font-bold">₹0</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="mt-6 space-y-4">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className="btn btn-outline w-full mt-6"
              disabled={profile?.subscription_tier === 'free'}
            >
              {profile?.subscription_tier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="card border-2 border-primary-500 relative">
          <div className="absolute -top-3 right-4">
            <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Recommended
            </span>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold">Pro Plan</h2>
            <p className="text-gray-600 mt-2">For serious habit builders</p>
            
            <div className="mt-4">
              <span className="text-3xl font-bold">₹999</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="mt-6 space-y-4">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleUpgrade}
              className="btn btn-primary w-full mt-6 flex items-center justify-center gap-2"
              disabled={profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'}
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'
                  ? 'Current Plan'
                  : 'Upgrade to Pro'
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Can I cancel my subscription?</h4>
            <p className="text-gray-600 mt-1">Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-medium">How do I upgrade my plan?</h4>
            <p className="text-gray-600 mt-1">Simply click the "Upgrade to Pro" button and follow the payment process. Your account will be upgraded immediately after successful payment.</p>
          </div>
          <div>
            <h4 className="font-medium">What payment methods do you accept?</h4>
            <p className="text-gray-600 mt-1">We accept all major credit/debit cards, UPI, and net banking through our secure payment processor, Razorpay.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;