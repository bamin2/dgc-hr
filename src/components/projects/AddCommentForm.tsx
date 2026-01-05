import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "./MentionTextarea";
import { TeamMember } from "./MentionSuggestions";
import { useTeamMembers } from "@/hooks/useProjects";

interface AddCommentFormProps {
  onSubmit: (comment: string, mentionedUserIds: string[]) => void;
}

// Helper to extract mentioned user IDs from comment text
const extractMentions = (comment: string, teamMembers: TeamMember[]): string[] => {
  const mentionPattern = /@([A-Za-z]+\s+[A-Za-z]+)/g;
  const mentionedIds: string[] = [];
  let match;

  while ((match = mentionPattern.exec(comment)) !== null) {
    const fullName = match[1];
    const member = teamMembers.find(
      m => `${m.first_name} ${m.last_name}`.toLowerCase() === fullName.toLowerCase()
    );
    if (member && !mentionedIds.includes(member.id)) {
      mentionedIds.push(member.id);
    }
  }

  return mentionedIds;
};

export function AddCommentForm({ onSubmit }: AddCommentFormProps) {
  const [comment, setComment] = useState("");
  const { data: teamMembers = [] } = useTeamMembers();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const mentionedUserIds = extractMentions(comment, teamMembers as TeamMember[]);
    onSubmit(comment.trim(), mentionedUserIds);
    setComment("");
  }, [comment, teamMembers, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <MentionTextarea
        value={comment}
        onChange={setComment}
        teamMembers={teamMembers as TeamMember[]}
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
