"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { store, AppStore } from "./store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}