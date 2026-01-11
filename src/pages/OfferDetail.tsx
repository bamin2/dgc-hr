import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOffer } from "@/hooks/useOffers";
import { OfferStatusBadge } from "@/components/hiring/offers/OfferStatusBadge";
import { OfferVersionCard } from "@/components/hiring/offers/OfferVersionCard";
import { OfferVersionEditor } from "@/components/hiring/offers/OfferVersionEditor";
import { OfferLetterPreview } from "@/components/hiring/offers/OfferLetterPreview";
import { Skeleton } from "@/components/ui/skeleton";

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: offer, isLoading } = useOffer(id);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Get the selected version or the current version
  const selectedVersion = selectedVersionId 
    ? offer?.versions?.find(v => v.id === selectedVersionId)
    : offer?.current_version;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!offer) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Offer not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/hiring")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono">{offer.offer_code}</h1>
              <OfferStatusBadge status={offer.status} />
            </div>
            <p className="text-muted-foreground">
              For: {offer.candidate?.first_name} {offer.candidate?.last_name}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Version Details</TabsTrigger>
                <TabsTrigger value="letter">Offer Letter</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                {selectedVersion ? (
                  <OfferVersionEditor 
                    version={selectedVersion} 
                    offerId={offer.id}
                    candidateId={offer.candidate_id}
                    candidateNationality={offer.candidate?.nationality}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Select a version to view details
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="letter" className="mt-4">
                {selectedVersion ? (
                  <OfferLetterPreview 
                    version={selectedVersion}
                    candidate={offer.candidate}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Select a version to preview the offer letter
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Version History Sidebar */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {offer.versions?.length || 0} version(s)
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {offer.versions?.map((version) => (
                <OfferVersionCard
                  key={version.id}
                  version={version}
                  isSelected={selectedVersion?.id === version.id}
                  onClick={() => setSelectedVersionId(version.id)}
                />
              ))}
              {(!offer.versions || offer.versions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No versions yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
