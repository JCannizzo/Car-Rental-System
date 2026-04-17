import { createFileRoute } from '@tanstack/react-router'
import AuthPage from '../pages/AuthPage'

type AuthSearch = {
  mode?: "login" | "register";
  redirect?: string;
};

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === "register" ? "register" : "login",
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
})
