import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { BenefitType, BenefitStatus } from '@/hooks/useBenefitPlans';

interface BenefitsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: BenefitType | 'all';
  onTypeChange: (value: BenefitType | 'all') => void;
  statusFilter?: BenefitStatus | 'all';
  onStatusChange?: (value: BenefitStatus | 'all') => void;
  showStatusFilter?: boolean;
}

export const BenefitsFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter = 'all',
  onStatusChange,
  showStatusFilter = false
}: BenefitsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search benefits..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as BenefitType | 'all')}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Benefit Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="dental">Dental</SelectItem>
          <SelectItem value="vision">Vision</SelectItem>
          <SelectItem value="retirement">Retirement</SelectItem>
          <SelectItem value="life">Life</SelectItem>
          <SelectItem value="disability">Disability</SelectItem>
          <SelectItem value="wellness">Wellness</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      {showStatusFilter && onStatusChange && (
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as BenefitStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
