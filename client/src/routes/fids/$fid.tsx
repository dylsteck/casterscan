import { createFileRoute } from '@tanstack/react-router'
import { FidDetail } from '../../components/FidDetail'

export const Route = createFileRoute('/fids/$fid')({
  component: FidDetailPage,
})

function FidDetailPage() {
  const { fid } = Route.useParams()
  
  return <FidDetail fid={fid} />
}
