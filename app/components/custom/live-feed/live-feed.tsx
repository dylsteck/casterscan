import { useEventStream } from '../../../hooks/use-event-stream';
import { useInfo } from '../../../hooks/use-info';
import { LiveFeedStats } from './live-feed-stats';
import { LiveFeedTable } from './live-feed-table';

export function LiveFeed() {
  const { events } = useEventStream();
  const { info, isLoading } = useInfo();

  return (
    <div className="w-full">
      <LiveFeedStats info={info} isLoading={isLoading} />
      <LiveFeedTable events={events} />
    </div>
  );
}
