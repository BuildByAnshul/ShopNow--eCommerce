import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, logout } from '../redux/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';
import { User, ShoppingBag, HelpCircle, LogOut, Mail, ShieldCheck, PhoneCall, Laptop, Smartphone, Lock, Key } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [userProfile, setUserProfile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const fetchProfileInfo = async () => {
    try {
      const res = await api.get('/auth/me');
      setUserProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  // Active Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      toast.error('Failed to load active sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleForceLogoutSession = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/logout`);
      toast.success('Session logged out');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to force logout session');
    }
  };

  const handleLogoutAllOtherSessions = async () => {
    try {
      await api.patch(`/sessions/users/${user._id}/logout-all`);
      toast.success('All other sessions terminated');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to logout sessions');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    
    try {
      await dispatch(updateProfile({ name })).unwrap();
      toast.success('Profile updated successfully!');
      fetchProfileInfo();
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleCreateOrUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setUpdatingPassword(true);
    try {
      const res = await api.put('/auth/profile', { name, password });
      toast.success(res.data?.message || 'Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
      fetchProfileInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
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
    { id: 'sessions', label: 'Active Sessions', icon: Laptop },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-botanical-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-botanical-text">
            Hello, <em className="italic text-botanical-accent">{user?.name?.split(' ')[0]}</em>
          </h1>
          <p className="font-sans text-botanical-muted mt-2">Manage your account and active devices</p>
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

                  {/* Password Management for Google & Standard Users */}
                  <div className="mt-12 pt-8 border-t border-botanical-border max-w-md">
                    <h3 className="font-serif text-xl font-semibold text-botanical-text mb-2 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-botanical-primary" />
                      {userProfile?.hasPassword ? 'Change Account Password' : 'Create Account Password'}
                    </h3>

                    {userProfile?.googleId && !userProfile?.hasPassword && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-sans">
                        You currently log in using <strong>Google Sign-In</strong>. Setting a password will allow you to log in using <strong>Email & Password</strong> as well!
                      </div>
                    )}

                    <form onSubmit={handleCreateOrUpdatePassword} className="space-y-4">
                      <Input
                        label="New Password"
                        id="newPassword"
                        type="password"
                        placeholder="Enter password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Input
                        label="Confirm New Password"
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />

                      <Button type="submit" loading={updatingPassword} variant="primary" className="w-full sm:w-auto">
                        {userProfile?.hasPassword ? 'Update Password' : 'Set Password'}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div>
                  <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-botanical-text">Where You're Logged In</h2>
                      <p className="font-sans text-xs text-botanical-muted mt-1">Devices currently logged into your account</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogoutAllOtherSessions}>
                      Logout All Other Devices
                    </Button>
                  </div>

                  {loadingSessions ? (
                    <div className="text-center py-8 text-botanical-muted font-sans text-sm">Loading active devices...</div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-botanical-muted font-sans text-sm">No active sessions found.</div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((sess) => {
                        const isMobile = sess.device?.toLowerCase().includes('mobile') || sess.device?.toLowerCase().includes('android') || sess.device?.toLowerCase().includes('iphone');
                        const IconComponent = isMobile ? Smartphone : Laptop;
                        const isSelf = sess.userId?._id === user?._id || sess.userId === user?._id;

                        return (
                          <div key={sess._id} className="p-4 bg-botanical-surface rounded-2xl border border-botanical-border flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-botanical-border">
                                <IconComponent className="w-6 h-6 text-botanical-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-sans font-medium text-sm text-botanical-text">
                                    {sess.userId?.name || user?.name}
                                  </h4>
                                  {isSelf && (
                                    <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                      Active Device
                                    </span>
                                  )}
                                </div>
                                <p className="font-sans text-xs text-botanical-muted mt-0.5">
                                  IP: {sess.ip || 'Unknown'} • Last Active: {new Date(sess.lastActive).toLocaleString()}
                                </p>
                                <p className="font-sans text-[11px] text-gray-400 max-w-md truncate mt-0.5" title={sess.device}>
                                  {sess.device || 'Browser / Device'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleForceLogoutSession(sess._id)}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                              Force Logout
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
