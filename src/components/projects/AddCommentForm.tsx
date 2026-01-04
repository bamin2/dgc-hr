import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "./MentionTextarea";
import { Employee, mockEmployees } from "@/data/employees";

interface AddCommentFormProps {
  onSubmit: (comment: string, mentionedUserIds: string[]) => void;
  teamMembers?: Employee[];
}

// Helper to extract mentioned user IDs from comment text
const extractMentions = (comment: string, teamMembers: Employee[]): string[] => {
  const mentionPattern = /@([A-Za-z]+\s+[A-Za-z]+)/g;
  const mentionedIds: string[] = [];
  let match;

  while ((match = mentionPattern.exec(comment)) !== null) {
    const fullName = match[1];
    const employee = teamMembers.find(
      e => `${e.firstName} ${e.lastName}`.toLowerCase() === fullName.toLowerCase()
    );
    if (employee && !mentionedIds.includes(employee.id)) {
      mentionedIds.push(employee.id);
    }
  }

  return mentionedIds;
};

export function AddCommentForm({ onSubmit, teamMembers = mockEmployees }: AddCommentFormProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const mentionedUserIds = extractMentions(comment, teamMembers);
    onSubmit(comment.trim(), mentionedUserIds);
    setComment("");
  }, [comment, teamMembers, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <MentionTextarea
        value={comment}
        onChange={setComment}
        teamMembers={teamMembers}
        placeholder="Add a comment... Use @ to mention someone"
        className="min-h-[80px] resize-none"
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!comment.trim()}
        className="shrink-0 self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
