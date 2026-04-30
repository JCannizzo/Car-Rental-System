import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/testimontals")({
  component: TestimontalsRedirect,
});

function TestimontalsRedirect() {
  const navigate = Route.useNavigate();

  useEffect(() => {
    void navigate({ to: "/testimonials", replace: true });
  }, [navigate]);

  return null;
}
