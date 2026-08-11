import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { User as UserIcon, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser._id) {
      toast.error("You cannot change your own role.");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/auth/users/${selectedUser._id}`);
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <div className="mb-10">
          <h1 className="section-heading mb-1">
            Manage <em className="italic text-botanical-primary">Users</em>
          </h1>
          <p className="font-sans text-botanical-muted text-sm">{users.length} registered users</p>
        </div>

        {loading ? (
          <Spinner size="lg" className="mt-20" />
        ) : (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-botanical-border bg-botanical-surface/50">
                    <th className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-botanical-border/50 hover:bg-botanical-surface/30 transition-colors">
                      <td className="px-6 py-4 font-sans text-sm font-medium text-botanical-text flex items-center gap-3">
                        <div className="w-10 h-10 bg-botanical-primary/10 text-botanical-primary rounded-full flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                        {u._id === currentUser._id && <span className="text-xs bg-botanical-primary text-white px-2 py-0.5 rounded-full ml-2">You</span>}
                      </td>
                      <td className="px-6 py-4 font-sans text-sm text-botanical-muted">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-medium ${u.role === 'admin' ? 'bg-botanical-primary/10 text-botanical-primary' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-sm text-botanical-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            className="p-2 text-xs font-sans font-medium text-botanical-primary hover:bg-botanical-primary/10 rounded-xl transition-all"
                            disabled={u._id === currentUser._id}
                            style={{ opacity: u._id === currentUser._id ? 0.5 : 1 }}
                          >
                            Make {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            onClick={() => { setSelectedUser(u); setDeleteModalOpen(true); }}
                            className="p-2 rounded-xl hover:bg-red-50 text-botanical-muted hover:text-red-500 transition-all"
                            disabled={u._id === currentUser._id}
                            style={{ opacity: u._id === currentUser._id ? 0.5 : 1 }}
                            aria-label="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete User" maxWidth="max-w-sm">
        <p className="font-sans text-sm text-botanical-muted mb-6">
          Are you sure you want to delete <strong className="text-botanical-text">{selectedUser?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleDelete} variant="accent" className="flex-1">Delete</Button>
          <Button onClick={() => setDeleteModalOpen(false)} variant="secondary">Cancel</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
