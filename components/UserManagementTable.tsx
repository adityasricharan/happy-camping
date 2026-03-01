'use client';

import { useState, useEffect } from 'react';

type User = {
    id: string;
    username: string;
    role: string;
    isActive: boolean;
    canResetPasswords: boolean;
    karmaPoints: number;
    createdAt: string;
};

export default function UserManagementTable({ currentRole, currentUserId }: { currentRole: string, currentUserId: string }) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean, targetRole: string) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to update user status');
                return;
            }

            setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (err) {
            alert('An unexpected error occurred.');
        }
    };

    const togglePasswordMaster = async (id: string, currentPermission: boolean) => {
        if (!confirm(`Are you sure you want to ${currentPermission ? 'REVOKE' : 'GRANT'} password master privileges for this Admin?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${id}/permissions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canResetPasswords: !currentPermission })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to update user permissions');
                return;
            }

            setUsers(users.map(u => u.id === id ? { ...u, canResetPasswords: !currentPermission } : u));
        } catch (err) {
            alert('An unexpected error occurred.');
        }
    };

    const forcePasswordReset = async (id: string, targetUsername: string) => {
        const newPass = prompt(`Enter a new forced password for ${targetUsername} (min 6 characters):`);
        if (!newPass) return; // cancelled
        if (newPass.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: newPass })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to reset user password');
                return;
            }

            alert(data.message || 'Password successfully reset.');
        } catch (err) {
            alert('An unexpected error occurred.');
        }
    };


    if (loading) return <div className="p-8 text-center text-muted animate-pulse">Loading users...</div>;
    if (error) return <div className="p-8 text-center text-danger">{error}</div>;

    // Find if the current operating user is a password master themselves
    const currentUser = users.find(u => u.id === currentUserId);
    const isCurrentPasswordMaster = currentUser?.canResetPasswords || currentRole === 'SUPERADMIN';

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-surface-border text-sm text-muted">
                        <th className="p-4 font-medium">Username</th>
                        <th className="p-4 w-1/4 font-medium">Role</th>
                        <th className="p-4 font-medium">Status / Karma</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        const isSelf = user.id === currentUserId;
                        const isSuperAdminTarget = user.role === 'SUPERADMIN';
                        const isAdminTarget = user.role === 'ADMIN';

                        // Calculate Permissions
                        let canEditStatus = true;
                        if (isSelf) canEditStatus = false;
                        if (isSuperAdminTarget) canEditStatus = false;
                        if (currentRole === 'ADMIN' && isAdminTarget) canEditStatus = false;

                        let canGrantMaster = currentRole === 'SUPERADMIN' && isAdminTarget;

                        let canResetPassword = isCurrentPasswordMaster && !isSuperAdminTarget;
                        if (currentRole === 'ADMIN' && isAdminTarget) canResetPassword = false;
                        if (isSelf) canResetPassword = false; // Self-service is in Settings, not here

                        return (
                            <tr key={user.id} className="border-b border-surface-border/50 hover:bg-surface-border/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium">{user.username} {isSelf && <span className="text-xs ml-2 text-muted">(You)</span>}</div>
                                    <div className="text-xs text-muted font-mono mt-1" title={user.id}>{user.id.split('-')[0]}...</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'SUPERADMIN' ? 'bg-primary/20 text-primary' :
                                            user.role === 'ADMIN' ? 'bg-secondary text-white' : 'bg-surface-border text-muted'
                                        }`}>
                                        {user.role}
                                    </span>
                                    {user.canResetPasswords && (
                                        <span className="ml-2 text-xs text-primary" title="Password Master">🔑</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${user.isActive ? 'text-green-500' : 'text-danger'}`}>
                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-danger'}`}></span>
                                        {user.isActive ? 'Active' : 'Deactivated'}
                                    </div>
                                    <div className="text-xs text-muted flex items-center gap-1">
                                        ⭐ {user.karmaPoints} karma
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={() => toggleStatus(user.id, user.isActive, user.role)}
                                            disabled={!canEditStatus}
                                            className={`btn text-xs px-3 py-1.5 ${user.isActive ? 'btn-danger' : 'btn-primary'} ${!canEditStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Reactivate'}
                                        </button>

                                        {canGrantMaster && (
                                            <button
                                                onClick={() => togglePasswordMaster(user.id, user.canResetPasswords)}
                                                className={`btn btn-secondary text-xs px-3 py-1.5`}
                                            >
                                                {user.canResetPasswords ? 'Remove Password Master' : 'Make Password Master'}
                                            </button>
                                        )}

                                        {canResetPassword && (
                                            <button
                                                onClick={() => forcePasswordReset(user.id, user.username)}
                                                className={`btn btn-secondary text-xs px-3 py-1.5`}
                                            >
                                                🔑 Force Password Reset
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
