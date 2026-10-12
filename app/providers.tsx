"use client";

import { useRef } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
          },
        }}
      />
    </Provider>
  );
}
