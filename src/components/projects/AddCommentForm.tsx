import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AddCommentFormProps {
  onSubmit: (comment: string) => void;
}

export function AddCommentForm({ onSubmit }: AddCommentFormProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit(comment.trim());
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px] resize-none flex-1"
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
