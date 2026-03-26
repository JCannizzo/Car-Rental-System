import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold">About</h3>
      <p>This is the car rental system.</p>
    </div>
  )
}
