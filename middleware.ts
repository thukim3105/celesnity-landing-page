import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except API routes, Next internals, and any file with a
  // dot (static assets, DS images under /public, favicon, etc.).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
