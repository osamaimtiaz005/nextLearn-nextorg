import { auth } from "./auth"

// Export the middleware factory — do not call `auth()` here; that runs `headers()`
// at module load. The default export is invoked once per request by Next.js.
export default auth
export { auth as proxy }
export const config = {
  // https://nextjs.org/docs/app/api-reference/next-config-js/proxy#config
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
//The advantage of employing Proxy for this task is that the protected routes will not even start rendering
// until the Proxy verifies the authentication, enhancing both the security and performance of your application.
