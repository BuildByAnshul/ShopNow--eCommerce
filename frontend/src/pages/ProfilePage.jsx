import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, logout } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, ShoppingBag, HelpCircle, LogOut, Mail, ShieldCheck, PhoneCall } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    if (name === user?.name) return toast.success('Profile is already up to date');
    
    try {
      await dispatch(updateProfile({ name })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, onClick: () => navigate('/orders') },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-botanical-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-botanical-text">
            Hello, <em className="italic text-botanical-accent">{user?.name?.split(' ')[0]}</em>
          </h1>
          <p className="font-sans text-botanical-muted mt-2">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-4 shadow-soft">
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick || (() => setActiveTab(item.id))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-sans text-sm font-medium
                        ${isActive 
                          ? 'bg-botanical-surface text-botanical-primary' 
                          : 'text-botanical-text hover:bg-botanical-secondary'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-botanical-primary' : 'text-botanical-muted'}`} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="my-2 border-t border-botanical-border"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-sans text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-soft p-6 sm:p-10 animate-fade-in">
              
              {activeTab === 'profile' && (
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-6">Profile Settings</h2>
                  
                  <div className="flex items-center gap-4 mb-8 p-4 bg-botanical-surface rounded-2xl border border-botanical-border">
                    <div className="w-16 h-16 rounded-full bg-botanical-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-semibold font-serif">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-sans font-medium text-botanical-text">{user?.name}</h3>
                      <p className="font-sans text-sm text-botanical-muted flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5" /> {user?.email}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-5 max-w-md">
                    <Input
                      label="Full Name"
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-botanical-text font-sans mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-botanical-border bg-gray-50 text-botanical-muted font-sans text-sm cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-[calc(50%-10px)] flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </div>
                      </div>
                      <p className="text-xs text-botanical-muted mt-2 font-sans">
                        Email addresses cannot be changed once registered.
                      </p>
                    </div>

                    <Button type="submit" loading={loading} variant="primary" className="w-full sm:w-auto mt-4">
                      Save Changes
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'help' && (
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-botanical-text mb-6">Help & Support</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-6 border border-botanical-border rounded-2xl hover:border-botanical-primary transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-botanical-surface flex items-center justify-center mb-4 group-hover:bg-botanical-primary transition-colors">
                        <Mail className="w-5 h-5 text-botanical-primary group-hover:text-white" />
                      </div>
                      <h3 className="font-sans font-medium text-botanical-text mb-1">Email Us</h3>
                      <p className="font-sans text-sm text-botanical-muted">support@shopease.com</p>
                    </div>
                    <div className="p-6 border border-botanical-border rounded-2xl hover:border-botanical-primary transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-botanical-surface flex items-center justify-center mb-4 group-hover:bg-botanical-primary transition-colors">
                        <PhoneCall className="w-5 h-5 text-botanical-primary group-hover:text-white" />
                      </div>
                      <h3 className="font-sans font-medium text-botanical-text mb-1">Call Us</h3>
                      <p className="font-sans text-sm text-botanical-muted">1800-123-4567</p>
                    </div>
                  </div>
                  <div className="mt-8 p-6 bg-botanical-surface rounded-2xl border border-botanical-border">
                    <h3 className="font-serif text-lg font-medium text-botanical-text mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-sans font-medium text-botanical-text text-sm mb-1">How do I track my order?</h4>
                        <p className="font-sans text-sm text-botanical-muted">You can track your order by clicking on "My Orders" and selecting your recent purchase.</p>
                      </div>
                      <div>
                        <h4 className="font-sans font-medium text-botanical-text text-sm mb-1">What is the return policy?</h4>
                        <p className="font-sans text-sm text-botanical-muted">We offer a 7-day return policy for all unused and sealed products.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
