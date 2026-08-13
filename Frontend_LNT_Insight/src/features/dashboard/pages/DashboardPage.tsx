import React from 'react';
import { useParams } from 'react-router-dom';
import { submoduleComponentRegistry, DefaultPendingComponent } from '../../../app/pageRegistry';

export const DashboardPage: React.FC = () => {
  const { subModuleId } = useParams<{ subModuleId: string }>();

  const TargetComponent = submoduleComponentRegistry[subModuleId || ''] 
    || (() => <DefaultPendingComponent subId={subModuleId || ''} />);

  return (
    <div className="space-y-6">
      <TargetComponent />
    </div>
  );
};
