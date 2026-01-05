import { DepartmentsSection } from './DepartmentsSection';
import { PositionsSection } from './PositionsSection';

export function OrganizationSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Structure</h3>
        <p className="text-sm text-muted-foreground">
          Manage departments and job positions for your organization.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentsSection />
        <PositionsSection />
      </div>
    </div>
  );
}
