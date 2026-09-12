import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout({ active, onNavigate, title, subtitle, children, headerRight }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-text-primary">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          dark={dark}
          onToggleTheme={() => setDark((d) => !d)}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}