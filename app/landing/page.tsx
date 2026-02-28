import Link from 'next/link';

export default function Home() {
    return (
        <div className="container flex flex-col items-center justify-center min-h-screen text-center animate-fade-in" style={{ justifyContent: 'center', height: '100vh', display: 'flex' }}>
            <div className="card glass max-w-2xl w-full p-8">
                <h1 className="text-4xl font-bold mb-4">🏕️ Camping Gear Inventory</h1>
                <p className="text-muted mb-8 text-lg">
                    Manage your equipment, keep track of its condition, and loan it out to friends seamlessly.
                </p>
                <div className="flex gap-4 justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link href="/login" className="btn btn-primary">
                        Sign In
                    </Link>
                    <Link href="/register" className="btn btn-secondary">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
