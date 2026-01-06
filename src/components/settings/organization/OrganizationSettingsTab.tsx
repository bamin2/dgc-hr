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

      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentsSection />
        <PositionsSection />
      </div>

      <WorkLocationsSection />
    </div>
  );
}
