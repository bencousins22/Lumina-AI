
import React from 'react';
import { Thinking } from './thinking';
import { Tool } from './tool';
import { Artifact } from './artifact';
import { Markdown } from './markdown';
import { WebPreview } from './web-preview';
import { Plan } from './plan';
import { Task } from './task';

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  // 1. Split content by <thinking> tags
  const parts = content.split(/(<thinking>[\s\S]*?<\/thinking>)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        // Handle Thinking Blocks
        if (part.startsWith('<thinking>') && part.endsWith('</thinking>')) {
          const thinkingContent = part.replace(/<\/?thinking>/g, '').trim();
          return <Thinking key={index}>{thinkingContent}</Thinking>;
        }

        // Handle Tool Calls (Simple regex detection for demo purposes)
        // Matches patterns like [TOOL: name] input... [/TOOL]
        if (part.includes('[TOOL:')) {
            // This is a simplified parser for demonstration. 
            // In a real app, you'd want a more robust parser or structured JSON from the model.
            return <Markdown key={index} content={part} />;
        }

        if (!part.trim()) return null;

        return <ContentBlockRenderer key={index} content={part} />;
      })}
    </div>
  );
};

// Helper to detect artifacts/code blocks within standard markdown
const ContentBlockRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Regex to find code blocks: ```language code ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Push text before code block
        if (match.index > lastIndex) {
            elements.push(
                <Markdown key={`text-${lastIndex}`} content={content.slice(lastIndex, match.index)} />
            );
        }

        const language = match[1]?.toLowerCase();
        const code = match[2];

        // Automate: Render HTML as WebPreview or Artifact
        if (language === 'html') {
            elements.push(
                <WebPreview key={`preview-${match.index}`} html={code} className="my-4" />
            );
        } 
        // Automate: Render React/JSX as Artifact
        else if (language === 'tsx' || language === 'jsx' || language === 'react') {
            elements.push(
                <Artifact 
                    key={`artifact-${match.index}`} 
                    title="React Component" 
                    type="code" 
                    onOpen={() => { /* Handle open */ }} 
                />
            );
            // We also render the markdown for the code so they can see it
            elements.push(<Markdown key={`md-${match.index}`} content={match[0]} />);
        }
        else {
            elements.push(<Markdown key={`md-${match.index}`} content={match[0]} />);
        }

        lastIndex = match.index + match[0].length;
    }

    // Push remaining text
    if (lastIndex < content.length) {
        elements.push(<Markdown key={`text-${lastIndex}`} content={content.slice(lastIndex)} />);
    }

    return <>{elements}</>;
};
