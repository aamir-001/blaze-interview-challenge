import { Alert } from '../types';
import AlertList from '../components/AlertList';

interface AllAlertsPageProps {
  alerts: Alert[];
  onBack: () => void;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, currentEnabled: boolean) => Promise<void>;
}

export default function AllAlertsPage({ alerts, onBack, onDelete, onToggle }: AllAlertsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Alerts</h1>
        </div>

        <AlertList alerts={alerts} onDelete={onDelete} onToggle={onToggle} />
      </div>
    </div>
  );
}
