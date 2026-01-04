import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MentionSuggestions } from "./MentionSuggestions";
import { Employee } from "@/data/employees";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  teamMembers: Employee[];
  placeholder?: string;
  className?: string;
}

export function MentionTextarea({ 
  value, 
  onChange, 
  teamMembers, 
  placeholder,
  className 
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter team members based on query
  const filteredSuggestions = teamMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(mentionQuery.toLowerCase());
  }).slice(0, 5);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions.length]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);

    // Check for @ trigger
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space or newline before @ (or it's at the start)
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show suggestions if no space after the name (still typing)
        if (!textAfterAt.includes(' ') || textAfterAt.split(' ').length <= 2) {
          setShowSuggestions(true);
          setMentionQuery(textAfterAt);
          setMentionStartIndex(lastAtIndex);
          return;
        }
      }
    }
    
    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStartIndex(null);
  }, [onChange]);

  const insertMention = useCallback((employee: Employee) => {
    if (mentionStartIndex === null) return;
    
    const fullName = `${employee.firstName} ${employee.lastName}`;
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${fullName} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStartIndex(null);
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartIndex + fullName.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, mentionStartIndex, mentionQuery, onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        if (showSuggestions && filteredSuggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Tab':
        if (showSuggestions && filteredSuggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedIndex, insertMention]);

  return (
    <div className="relative flex-1">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        onBlur={() => {
          // Delay hiding to allow click on suggestion
          setTimeout(() => setShowSuggestions(false), 200);
        }}
      />
      {showSuggestions && (
        <MentionSuggestions
          suggestions={filteredSuggestions}
          selectedIndex={selectedIndex}
          onSelect={insertMention}
        />
      )}
    </div>
  );
}
