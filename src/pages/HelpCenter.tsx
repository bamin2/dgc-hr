import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HelpCircle, BookOpen } from "lucide-react";
import {
  HelpCenterSearch,
  QuickLinksSection,
  FAQSection,
} from "@/components/help-center";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about using DGC CORE. Browse by topic or search for specific help.
          </p>
        </div>

        {/* Search */}
        <HelpCenterSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Quick Links */}
        {!searchQuery && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Quick Links
            </h2>
            <QuickLinksSection />
          </section>
        )}

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {searchQuery ? "Search Results" : "Frequently Asked Questions"}
          </h2>
          <FAQSection searchQuery={searchQuery} />
        </section>
      </div>
    </DashboardLayout>
  );
}
