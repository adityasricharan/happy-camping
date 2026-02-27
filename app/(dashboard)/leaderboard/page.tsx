import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const users = await prisma.user.findMany({
        select: { id: true, username: true, karmaPoints: true },
        orderBy: { karmaPoints: 'desc' },
        take: 100
    });

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Karma Leaderboard</h1>
            <div className="card glass">
                <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {users.map((user: any, idx: number) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-surface-border rounded-md" style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className="text-2xl font-bold border-surface-border rounded-full flex items-center justify-center p-2" style={{ width: '3rem', height: '3rem', textAlign: 'center', backgroundColor: 'var(--surface)' }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </span>
                                <span className="font-medium text-lg">{user.username}</span>
                            </div>
                            <div className="badge" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                                {user.karmaPoints} Points
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="text-muted text-center p-8">No karma data available yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
