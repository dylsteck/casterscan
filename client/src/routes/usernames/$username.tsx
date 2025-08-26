import { createFileRoute } from '@tanstack/react-router'
import { UsernameDetail } from '../../components/UsernameDetail'

export const Route = createFileRoute('/usernames/$username')({
  component: UsernameDetailPage,
})

function UsernameDetailPage() {
  const { username } = Route.useParams()
  
  return <UsernameDetail username={username} />
}
