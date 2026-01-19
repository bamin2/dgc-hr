import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { BenefitClaim } from '@/hooks/useBenefitClaims';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

interface ClaimsTableProps {
  claims: BenefitClaim[];
  onApprove?: (claimId: string) => void;
  onDeny?: (claimId: string) => void;
}

export const ClaimsTable = ({ claims, onApprove, onDeny }: ClaimsTableProps) => {
  const { formatCurrency } = useCompanySettings();

  if (claims.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No claims found.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Employee</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => {
            const employee = claim.employee;
            const plan = claim.plan;

            return (
              <TableRow key={claim.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee?.avatar_url || undefined} />
                      <AvatarFallback>
                        {employee?.first_name?.[0] || ''}{employee?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {employee?.first_name} {employee?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.provider_name || 'No provider'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {claim.description || 'Benefit claim'}
                </TableCell>
                <TableCell>
                  {plan?.type && <BenefitTypeBadge type={plan.type as any} showIcon={false} />}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatCurrency(claim.amount)}</p>
                    {claim.approved_amount && (
                      <p className="text-xs text-emerald-600">
                        Approved: {formatCurrency(claim.approved_amount)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(claim.claim_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <ClaimStatusBadge status={claim.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {claim.status === 'pending' && onApprove && onDeny && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => onApprove(claim.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeny(claim.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
