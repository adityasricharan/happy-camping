import { ReactNode } from 'react';
import Link from 'next/link';
import { getSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const logout = async () => {
        'use server';
        await deleteSession();
        redirect('/login');
    };

    return (
        <div className="flex min-h-screen" style={{ display: 'flex', minHeight: '100vh' }}>
            <aside className="glass border-r border-surface-border p-6 flex flex-col justify-between" style={{ width: '16rem', borderRight: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h2 className="text-xl font-bold mb-8">🏕️ CampSync</h2>
                    <nav className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link href="/" className="btn btn-secondary justify-start w-full" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Inventory
                        </Link>
                        <Link href="/loans" className="btn btn-secondary justify-start w-full" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Active Loans
                        </Link>
                        <Link href="/leaderboard" className="btn btn-secondary justify-start w-full" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Karma Leaderboard
                        </Link>
                        {(session.role === 'ADMIN' || session.role === 'SUPERADMIN') && (
                            <Link href="/admin/users" className="btn btn-secondary justify-start w-full" style={{ justifyContent: 'flex-start', width: '100%' }}>
                                👥 Manage Users
                            </Link>
                        )}
                        <Link href="/help" className="btn btn-secondary justify-start w-full" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            📖 User Manual
                        </Link>
                        {session.role === 'ADMIN' && (
                            <Link href="/admin/help" className="btn btn-secondary justify-start w-full" style={{ justifyContent: 'flex-start', width: '100%' }}>
                                🛡️ Admin Manual
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="border-t border-surface-border pt-4 mt-8" style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: '2rem' }}>
                    <div className="text-sm font-medium mb-1">
                        {session.username}
                    </div>
                    <div className="text-xs text-muted mb-4">
                        {session.role === 'ADMIN' ? 'Administrator' : 'Camper'}
                    </div>
                    <form action={logout}>
                        <button type="submit" className="btn btn-danger w-full text-xs" style={{ width: '100%', fontSize: '0.75rem' }}>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 p-8" style={{ flex: 1, padding: '2rem' }}>
                {children}
            </main>
        </div>
    );
}
