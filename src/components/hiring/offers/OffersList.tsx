import { useState } from "react";
import { Search, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOffers, type OfferStatus } from "@/hooks/useOffers";
import { OfferStatusBadge } from "./OfferStatusBadge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function OffersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">("all");

  const { data: offers, isLoading } = useOffers({ search, status: statusFilter });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search offers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OfferStatus | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer Code</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead className="hidden md:table-cell">Version</TableHead>
                <TableHead className="hidden lg:table-cell">Gross Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last Sent</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : offers?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No offers found</TableCell></TableRow>
              ) : (
                offers?.map((offer) => (
                  <TableRow key={offer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/hiring/offers/${offer.id}`)}>
                    <TableCell className="font-mono text-sm">{offer.offer_code}</TableCell>
                    <TableCell className="font-medium">
                      {offer.candidate?.first_name} {offer.candidate?.last_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">v{offer.current_version?.version_number || 1}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {offer.current_version ? `${offer.current_version.currency_code} ${offer.current_version.gross_pay_total?.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell><OfferStatusBadge status={offer.status} /></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {offer.current_version?.sent_at ? format(new Date(offer.current_version.sent_at), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/hiring/offers/${offer.id}`); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
