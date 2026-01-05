import { Link } from "react-router-dom";

interface CommentContentProps {
  content: string;
  mentionedUserIds?: string[];
}

export function CommentContent({ content, mentionedUserIds = [] }: CommentContentProps) {
  // Parse the content and highlight @mentions
  const mentionPattern = /@([A-Za-z]+\s+[A-Za-z]+)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionPattern.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const fullName = match[1];
    
    // Render as styled mention text
    parts.push(
      <span 
        key={match.index} 
        className="inline-flex items-center text-primary font-medium bg-primary/10 px-1 rounded"
      >
        @{fullName}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}
