import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default async function MarkdownViewer({ filePath }: { filePath: string }) {
    let content = '';

    try {
        // Resolve the absolute path of the markdown from the 'public' directory
        const absolutePath = path.join(process.cwd(), 'public', filePath);
        content = fs.readFileSync(absolutePath, 'utf-8');
    } catch (err) {
        console.error("Failed to read markdown content:", err);
        return <div className="text-center p-8 text-danger">Failed to load documentation file: {filePath}</div>;
    }

    return (
        <div className="prose prose-invert max-w-none dark:prose-invert">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b border-surface-border pb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-primary" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="text-muted" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-surface-border text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                    pre: ({ node, ...props }) => <pre className="bg-surface-border p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted my-4" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
