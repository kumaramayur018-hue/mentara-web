import React from 'react';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

/**
 * Formats AI chat messages with support for:
 * - **Bold text**
 * - *Italic text*
 * - Bullet points (•)
 * - Numbered lists
 * - Line breaks
 * - Emojis
 */
export function MessageFormatter({ content, className = '' }: MessageFormatterProps) {
  // Handle undefined or null content
  if (!content || typeof content !== 'string') {
    return <div className={className}>Loading...</div>;
  }

  const formatText = (text: string) => {
    // Safety check
    if (!text || typeof text !== 'string') {
      return <p>Loading...</p>;
    }

    // Split by line breaks to handle each line separately
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if line is a bullet point
      const isBulletPoint = line.trim().startsWith('•') || 
                           line.trim().startsWith('-') || 
                           line.trim().startsWith('*');
      
      // Check if line is a numbered list
      const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
      
      // Process inline formatting within the line
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      
      // Regular expression to match **bold**, *italic* patterns
      const boldRegex = /\*\*(.+?)\*\*/g;
      const italicRegex = /\*(.+?)\*/g;
      
      // First, replace bold text
      let processedLine = line;
      const boldMatches: Array<{ start: number; end: number; text: string }> = [];
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        boldMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1]
        });
      }
      
      // Then find italic text (but not those inside bold)
      const italicMatches: Array<{ start: number; end: number; text: string }> = [];
      while ((match = italicRegex.exec(line)) !== null) {
        // Check if this italic is not part of a bold pattern
        const isInsideBold = boldMatches.some(
          bold => match.index >= bold.start && match.index < bold.end
        );
        if (!isInsideBold) {
          italicMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[1]
          });
        }
      }
      
      // Sort all matches by position
      const allMatches = [
        ...boldMatches.map(m => ({ ...m, type: 'bold' as const })),
        ...italicMatches.map(m => ({ ...m, type: 'italic' as const }))
      ].sort((a, b) => a.start - b.start);
      
      // Build the formatted line
      let currentPos = 0;
      allMatches.forEach((match, index) => {
        // Add text before this match
        if (match.start > currentPos) {
          parts.push(line.substring(currentPos, match.start));
        }
        
        // Add formatted text
        if (match.type === 'bold') {
          parts.push(
            <strong key={`bold-${lineIndex}-${index}`} className="font-semibold">
              {match.text}
            </strong>
          );
        } else if (match.type === 'italic') {
          parts.push(
            <em key={`italic-${lineIndex}-${index}`} className="italic">
              {match.text}
            </em>
          );
        }
        
        currentPos = match.end;
      });
      
      // Add remaining text
      if (currentPos < line.length) {
        parts.push(line.substring(currentPos));
      }
      
      // If no matches found, use the original line
      if (parts.length === 0) {
        parts.push(line);
      }
      
      // Wrap in appropriate element based on line type
      if (isBulletPoint) {
        return (
          <div key={lineIndex} className="flex gap-2 ml-2 mb-2">
            <span className="text-primary mt-0.5">•</span>
            <span className="flex-1">{parts}</span>
          </div>
        );
      } else if (numberedMatch) {
        return (
          <div key={lineIndex} className="flex gap-2 ml-2 mb-2">
            <span className="text-primary font-semibold">{numberedMatch[1]}.</span>
            <span className="flex-1">{parts}</span>
          </div>
        );
      } else if (line.trim() === '') {
        return <div key={lineIndex} className="h-2" />;
      } else {
        return (
          <p key={lineIndex} className="mb-2 last:mb-0">
            {parts}
          </p>
        );
      }
    });
  };
  
  return (
    <div className={`message-content ${className}`}>
      {formatText(content)}
    </div>
  );
}