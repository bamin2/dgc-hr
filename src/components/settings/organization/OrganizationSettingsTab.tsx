import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Briefcase, MapPin } from 'lucide-react';
import { DepartmentsSection } from './DepartmentsSection';
import { PositionsSection } from './PositionsSection';
import { WorkLocationsSection } from './WorkLocationsSection';

export function OrganizationSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Structure</h3>
        <p className="text-sm text-muted-foreground">
          Manage departments, job positions and work locations for your organization.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Work Locations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments" className="mt-4">
          <DepartmentsSection />
        </TabsContent>
        
        <TabsContent value="positions" className="mt-4">
          <PositionsSection />
        </TabsContent>
        
        <TabsContent value="locations" className="mt-4">
          <WorkLocationsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
