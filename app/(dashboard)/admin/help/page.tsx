import MarkdownViewer from '@/components/MarkdownViewer';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminHelpPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-danger">🛡️ Administrator Manual</h1>
            <div className="card glass p-8 border border-danger/20">
                <MarkdownViewer filePath="/admin_manual.md" />
            </div>
        </div>
    );
}
