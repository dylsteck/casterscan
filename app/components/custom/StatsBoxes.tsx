export function StatsBoxes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Live Events</div>
        <div className="text-2xl font-semibold text-gray-900">∞</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Connected</div>
        <div className="text-2xl font-semibold text-green-600">●</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Source</div>
        <div className="text-sm font-medium text-gray-900">Snapchain Hub</div>
      </div>
    </div>
  );
}
