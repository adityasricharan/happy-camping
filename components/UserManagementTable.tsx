'use client';

import { useState, useEffect } from 'react';

type User = {
    id: string;
    username: string;
    role: string;
    isActive: boolean;
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

            // Refresh table locally
            setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (err) {
            alert('An unexpected error occurred.');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted animate-pulse">Loading users...</div>;
    if (error) return <div className="p-8 text-center text-danger">{error}</div>;

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-surface-border text-sm text-muted">
                        <th className="p-4 font-medium">Username</th>
                        <th className="p-4 w-1/4 font-medium">Role</th>
                        <th className="p-4 font-medium">Karma</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        const isSelf = user.id === currentUserId;
                        const isSuperAdmin = user.role === 'SUPERADMIN';
                        const isAdmin = user.role === 'ADMIN';

                        // Calculate Permissions
                        let canEdit = true;
                        if (isSelf) canEdit = false;
                        if (isSuperAdmin) canEdit = false; // Nobody alters superadmin via web UI
                        if (currentRole === 'ADMIN' && isAdmin) canEdit = false; // Admins can't touch Admins

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
                                </td>
                                <td className="p-4 font-mono text-sm">{user.karmaPoints}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-2 text-sm ${user.isActive ? 'text-green-500' : 'text-danger'}`}>
                                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-danger'}`}></span>
                                        {user.isActive ? 'Active' : 'Deactivated'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => toggleStatus(user.id, user.isActive, user.role)}
                                        disabled={!canEdit}
                                        className={`btn text-xs px-3 py-1.5 ${user.isActive ? 'btn-danger' : 'btn-primary'} ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
