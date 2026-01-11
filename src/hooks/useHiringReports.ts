import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HiringMetrics {
  totalCandidates: number;
  candidatesInPipeline: number;
  offersSent: number;
  offersAccepted: number;
  offersRejected: number;
  acceptanceRate: number;
  averageDaysToAccept: number | null;
  offersWithNegotiation: number;
}

export interface OffersByStatus {
  status: string;
  count: number;
}

export interface OffersOverTime {
  date: string;
  sent: number;
  accepted: number;
}

export function useHiringMetrics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["hiring-metrics", startDate, endDate],
    queryFn: async () => {
      // Get candidates count
      const { count: totalCandidates } = await supabase
        .from("candidates")
        .select("id", { count: "exact", head: true });

      const { count: candidatesInPipeline } = await supabase
        .from("candidates")
        .select("id", { count: "exact", head: true })
        .in("status", ["draft", "in_process", "offer_sent"]);

      // Get offers data
      let offersQuery = supabase.from("offers").select("id, status, created_at");
      if (startDate) {
        offersQuery = offersQuery.gte("created_at", startDate);
      }
      if (endDate) {
        offersQuery = offersQuery.lte("created_at", endDate);
      }
      const { data: offers } = await offersQuery;

      const offersSent = offers?.filter(o => o.status !== 'draft').length || 0;
      const offersAccepted = offers?.filter(o => o.status === 'accepted').length || 0;
      const offersRejected = offers?.filter(o => o.status === 'rejected').length || 0;
      const acceptanceRate = offersSent > 0 ? (offersAccepted / offersSent) * 100 : 0;

      // Get versions for negotiation count and days to accept
      const { data: versions } = await supabase
        .from("offer_versions")
        .select("offer_id, version_number, status, sent_at, accepted_at");

      // Count offers with multiple versions (negotiations)
      const offerVersionCounts: Record<string, number> = {};
      versions?.forEach(v => {
        offerVersionCounts[v.offer_id] = (offerVersionCounts[v.offer_id] || 0) + 1;
      });
      const offersWithNegotiation = Object.values(offerVersionCounts).filter(count => count > 1).length;

      // Calculate average days to accept
      const acceptedVersions = versions?.filter(v => v.status === 'accepted' && v.sent_at && v.accepted_at);
      let averageDaysToAccept: number | null = null;
      
      if (acceptedVersions && acceptedVersions.length > 0) {
        const totalDays = acceptedVersions.reduce((sum, v) => {
          const sentDate = new Date(v.sent_at!);
          const acceptedDate = new Date(v.accepted_at!);
          return sum + (acceptedDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        averageDaysToAccept = totalDays / acceptedVersions.length;
      }

      return {
        totalCandidates: totalCandidates || 0,
        candidatesInPipeline: candidatesInPipeline || 0,
        offersSent,
        offersAccepted,
        offersRejected,
        acceptanceRate,
        averageDaysToAccept,
        offersWithNegotiation,
      } as HiringMetrics;
    },
  });
}

export function useOffersByStatus() {
  return useQuery({
    queryKey: ["offers-by-status"],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select("status");

      const statusCounts: Record<string, number> = {};
      data?.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })) as OffersByStatus[];
    },
  });
}

export function useOffersOverTime(days: number = 30) {
  return useQuery({
    queryKey: ["offers-over-time", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: versions } = await supabase
        .from("offer_versions")
        .select("sent_at, accepted_at, status")
        .gte("created_at", startDate.toISOString());

      // Group by date
      const dateMap: Record<string, { sent: number; accepted: number }> = {};
      
      versions?.forEach(v => {
        if (v.sent_at) {
          const date = v.sent_at.split('T')[0];
          if (!dateMap[date]) dateMap[date] = { sent: 0, accepted: 0 };
          dateMap[date].sent++;
        }
        if (v.accepted_at) {
          const date = v.accepted_at.split('T')[0];
          if (!dateMap[date]) dateMap[date] = { sent: 0, accepted: 0 };
          dateMap[date].accepted++;
        }
      });

      return Object.entries(dateMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)) as OffersOverTime[];
    },
  });
}
