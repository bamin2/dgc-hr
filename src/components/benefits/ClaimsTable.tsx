import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { BenefitClaim } from '@/data/benefits';

interface ClaimsTableProps {
  claims: BenefitClaim[];
  onApprove?: (claimId: string) => void;
  onDeny?: (claimId: string) => void;
}

export const ClaimsTable = ({ claims, onApprove, onDeny }: ClaimsTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Employee</TableHead>
            <TableHead>Claim Type</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow key={claim.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={claim.employee.avatar} />
                    <AvatarFallback>
                      {claim.employee.firstName[0]}{claim.employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{claim.employee.firstName} {claim.employee.lastName}</p>
                    <p className="text-xs text-muted-foreground">{claim.provider}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{claim.claimType}</TableCell>
              <TableCell>
                <BenefitTypeBadge type={claim.plan.type} showIcon={false} />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">${claim.amount.toLocaleString()}</p>
                  {claim.approvedAmount && (
                    <p className="text-xs text-emerald-600">Approved: ${claim.approvedAmount.toLocaleString()}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(claim.submittedDate), 'MMM d, yyyy')}
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
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => onApprove(claim.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDeny(claim.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
