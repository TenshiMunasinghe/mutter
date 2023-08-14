import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";
import { Toaster } from "~/@/components/ui/toaster";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
