import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
  
  export function Layout({ children }) {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>EduTrack</title>
          <Meta />
          <Links />
        </head>
        <body class="bg-[#1D2F4D] h-full w-full m-0">
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
     </html>
    )
    }
  
  export default function Root() {
    return <Outlet />;
  }
  