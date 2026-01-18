import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faqCategories } from "./faqData";
import { cn } from "@/lib/utils";

interface FAQSectionProps {
  searchQuery: string;
}

export function FAQSection({ searchQuery }: FAQSectionProps) {
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqCategories;
    }

    const query = searchQuery.toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchQuery]);

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No results found for "{searchQuery}". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={filteredCategories[0]?.id} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent justify-start mb-6">
        {filteredCategories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {category.label}
            {searchQuery && (
              <span className="ml-1.5 text-xs opacity-70">
                ({category.items.length})
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {filteredCategories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-0">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {category.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
