import MarkdownViewer from '@/components/MarkdownViewer';

export default function PublicHelpPage() {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">User Documentation</h1>
            <div className="card glass p-8">
                <MarkdownViewer filePath="/public_manual.md" />
            </div>
        </div>
    );
}
