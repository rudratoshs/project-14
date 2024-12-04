import { ReactNode } from 'react';
import { CopyBlock, dracula } from "react-code-blocks";

export const formatContent = (content: string): ReactNode[] => {
    if (!content) return [];

    // Split content into sections
    const sections = content.split('\n\n');

    return sections.map((section, index) => {
        // Handle code blocks
        if (section.includes('<code>')) {
            const code = section
                .match(/<code>([\s\S]+?)<\/code>/)?.[1]
                ?.trim();
            if (code) {
                return (
                    <div key={index} className="my-6">
                        <CopyBlock
                            text={code}
                            language="javascript"
                            theme={dracula}
                            showLineNumbers={true}
                            wrapLines
                        />
                    </div>
                );
            }
        }

        // Handle lists
        if (section.match(/^\s*[\-\*]\s/m)) {
            const items = section.split('\n').map(item => 
                item.replace(/^\s*[\-\*]\s/, '')
            );

            return (
                <ul key={index} className="my-4 space-y-2">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start">
                            <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        // Handle bold text
        const formattedText = section.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-semibold text-gray-900">$1</strong>'
        );

        // Regular paragraph
        return (
            <p
                key={index}
                className="my-4 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formattedText }}
            />
        );
    });
};