import { createFileRoute } from '@tanstack/react-router'
import { CastDetail } from '../../components/CastDetail'

export const Route = createFileRoute('/casts/$hash')({
  component: CastDetailPage,
})

function CastDetailPage() {
  const { hash } = Route.useParams()
  
  return <CastDetail hash={hash} />
}
