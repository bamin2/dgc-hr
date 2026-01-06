import { Badge } from "@/components/ui/badge";
import { smartTags, smartTagCategories } from "@/data/smartTags";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SmartTagsPanelProps {
  onInsertTag: (tag: string) => void;
}

export function SmartTagsPanel({ onInsertTag }: SmartTagsPanelProps) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h4 className="text-sm font-medium mb-3">Smart Tags (click to insert)</h4>
      <ScrollArea className="h-[200px]">
        <div className="space-y-4">
          {smartTagCategories.map((category) => (
            <div key={category}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
              <div className="flex flex-wrap gap-1.5">
                {smartTags
                  .filter((t) => t.category === category)
                  .map((tag) => (
                    <Badge
                      key={tag.tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      onClick={() => onInsertTag(tag.tag)}
                      title={tag.description}
                    >
                      {tag.tag}
                    </Badge>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
