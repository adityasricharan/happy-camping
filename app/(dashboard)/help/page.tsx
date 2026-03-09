import MarkdownViewer from '@/components/MarkdownViewer';
import SupportForm from '@/components/SupportForm';

export default function PublicHelpPage() {
    return (
        <div className="animate-fade-in max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            <div className="flex-1 order-2 lg:order-1">
                <h1 className="text-3xl font-bold mb-6">User Documentation</h1>
                <div className="card glass p-8">
                    <MarkdownViewer filePath="/public_manual.md" />
                </div>
            </div>

            <div className="lg:w-1/3 order-1 lg:order-2">
                <SupportForm />
            </div>
        </div>
    );
}
