"use client";

import { useRef } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { AuthSessionProvider } from "@/lib/public/useHasAuthToken";
import { makeStore, type AppStore } from "@/lib/store/store";

export function Providers({
  initialHasToken,
  children,
}: {
  initialHasToken: boolean;
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthSessionProvider initialHasToken={initialHasToken}>{children}</AuthSessionProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerClassName="app-toast-container"
        toastOptions={{ duration: 3000 }}
      />
    </Provider>
  );
}
