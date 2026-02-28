import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserManagementTable from '@/components/UserManagementTable';

export default async function AdminUsersPage() {
    const session = await getSession();

    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
        redirect('/');
    }

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-3xl font-bold">👥 User Management</h1>
                    <p className="text-muted mt-2">Manage platform access, active status, and permissions across all instances.</p>
                </div>
                <div className="flex gap-4 items-center" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="px-4 py-2 bg-surface-border rounded-full text-sm font-medium">
                        Your Clearance: <span className={session.role === 'SUPERADMIN' ? 'text-primary' : ''}>{session.role}</span>
                    </div>
                </div>
            </div>

            <div className="card glass p-0 overflow-hidden">
                <UserManagementTable currentRole={session.role} currentUserId={session.userId as string} />
            </div>
        </div>
    );
}
