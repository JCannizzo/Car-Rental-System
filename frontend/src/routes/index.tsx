import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button onClick={() => setCount(count + 1)}>Click me</Button>
      <p>You clicked {count} times</p>
    </div>
  )
}
