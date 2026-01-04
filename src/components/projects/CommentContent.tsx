import { Link } from "react-router-dom";
import { mockEmployees } from "@/data/employees";

interface CommentContentProps {
  content: string;
  mentionedUserIds?: string[];
}

export function CommentContent({ content, mentionedUserIds = [] }: CommentContentProps) {
  // Parse the content and replace @mentions with links
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
    // Find the employee by name
    const employee = mockEmployees.find(
      e => `${e.firstName} ${e.lastName}`.toLowerCase() === fullName.toLowerCase()
    );

    if (employee && mentionedUserIds.includes(employee.id)) {
      // Render as a clickable link
      parts.push(
        <Link
          key={`${employee.id}-${match.index}`}
          to={`/employees/${employee.id}`}
          className="inline-flex items-center text-primary font-medium bg-primary/10 px-1 rounded hover:bg-primary/20 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          @{employee.firstName} {employee.lastName}
        </Link>
      );
    } else {
      // Just render as styled text if we can't find the employee
      parts.push(
        <span key={match.index} className="text-primary font-medium">
          @{fullName}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}
