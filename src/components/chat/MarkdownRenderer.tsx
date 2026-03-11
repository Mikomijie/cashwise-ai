import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let listKey = 0;

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListTag key={`list-${listKey++}`} className="my-2 ml-4 space-y-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="my-1">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    const renderInlineMarkdown = (text: string): React.ReactNode => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Bold with **
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          parts.push(
            <strong key={`bold-${key++}`} className="font-semibold">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
          continue;
        }

        // Bold with __
        const boldMatch2 = remaining.match(/__(.+?)__/);
        if (boldMatch2 && boldMatch2.index !== undefined) {
          if (boldMatch2.index > 0) {
            parts.push(remaining.slice(0, boldMatch2.index));
          }
          parts.push(
            <strong key={`bold-${key++}`} className="font-semibold">
              {boldMatch2[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch2.index + boldMatch2[0].length);
          continue;
        }

        // Italic with *
        const italicMatch = remaining.match(/\*(.+?)\*/);
        if (italicMatch && italicMatch.index !== undefined) {
          if (italicMatch.index > 0) {
            parts.push(remaining.slice(0, italicMatch.index));
          }
          parts.push(
            <em key={`italic-${key++}`} className="italic">
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
          continue;
        }

        // No more markdown, add remaining text
        parts.push(remaining);
        break;
      }

      return parts.length > 0 ? parts : text;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('###')) {
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-base md:text-lg font-bold mt-4 mb-2">
            {renderInlineMarkdown(trimmedLine.slice(3).trim())}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('##')) {
        flushList();
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg md:text-xl font-bold mt-4 mb-2">
            {renderInlineMarkdown(trimmedLine.slice(2).trim())}
          </h2>
        );
        return;
      }

      if (trimmedLine.startsWith('#')) {
        flushList();
        elements.push(
          <h1 key={`h1-${index}`} className="text-xl md:text-2xl font-bold mt-4 mb-2">
            {renderInlineMarkdown(trimmedLine.slice(1).trim())}
          </h1>
        );
        return;
      }

      // Unordered list
      if (trimmedLine.match(/^[-*]\s+/)) {
        const content = trimmedLine.replace(/^[-*]\s+/, '');
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(content);
        return;
      }

      // Ordered list
      if (trimmedLine.match(/^\d+\.\s+/)) {
        const content = trimmedLine.replace(/^\d+\.\s+/, '');
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(content);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${index}`} className="my-2 leading-relaxed">
          {renderInlineMarkdown(trimmedLine)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return <div className="markdown-content">{renderContent()}</div>;
}
