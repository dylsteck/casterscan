interface UsernameDetailProps {
  username: string;
}

export function UsernameDetail({ username }: UsernameDetailProps) {
  return (
    <div className="w-full">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Username Detail</h1>
        <p className="text-gray-600">Username: {username}</p>
      </div>
    </div>
  )
}
