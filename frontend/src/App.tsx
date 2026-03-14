import { useState } from "react"
import { Button } from "@/components/ui/button"

function App() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
  }
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Button onClick={handleClick}>Click me</Button>
      <p>You clicked {count} times</p>
    </div>
  )
}

export default App
