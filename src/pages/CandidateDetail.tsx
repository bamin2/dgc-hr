import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Building, Briefcase, Calendar, User, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useCandidate } from "@/hooks/useCandidates";
import { useOffers, useCreateOffer } from "@/hooks/useOffers";
import { CandidateStatusBadge } from "@/components/hiring/candidates/CandidateStatusBadge";
import { OfferStatusBadge } from "@/components/hiring/offers/OfferStatusBadge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: candidate, isLoading } = useCandidate(id);
  const { data: offers } = useOffers({ candidateId: id });
  const createOffer = useCreateOffer();

  const handleCreateOffer = async () => {
    if (!id) return;
    const offer = await createOffer.mutateAsync(id);
    navigate(`/hiring/offers/${offer.id}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <PageHeader
          title={`${candidate.first_name} ${candidate.last_name}`}
          subtitle={candidate.candidate_code}
          breadcrumbs={[
            { label: 'Hiring', href: '/hiring' },
            { label: `${candidate.first_name} ${candidate.last_name}` }
          ]}
          actions={
            candidate.status !== 'archived' && candidate.status !== 'offer_accepted' ? (
              <Button onClick={handleCreateOffer} disabled={createOffer.isPending}>
                <FileText className="h-4 w-4 mr-2" />
                Create Offer
              </Button>
            ) : undefined
          }
        >
          <CandidateStatusBadge status={candidate.status} />
        </PageHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.nationality && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Nationality: {candidate.nationality}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposed Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.work_location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.work_location.name}</span>
                </div>
              )}
              {candidate.department && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.department.name}</span>
                </div>
              )}
              {candidate.position && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.position.title}</span>
                </div>
              )}
              {candidate.manager && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Manager: {candidate.manager.first_name} {candidate.manager.last_name}</span>
                </div>
              )}
              {candidate.proposed_start_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Start Date: {format(new Date(candidate.proposed_start_date), "PPP")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {candidate.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{candidate.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Offers Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offers</CardTitle>
          </CardHeader>
          <CardContent>
            {!offers || offers.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No offers created yet</p>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/hiring/offers/${offer.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium font-mono">{offer.offer_code}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {offer.current_version?.version_number || 1} • Created {format(new Date(offer.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <OfferStatusBadge status={offer.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
