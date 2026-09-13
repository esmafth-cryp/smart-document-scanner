import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout({
  active,
  onNavigate,
  title,
  subtitle,
  children,
  onSelectScan,
  onSeeAll,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setMobileOpen(false);
  }, [active]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-text-primary">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          dark={dark}
          onToggleTheme={() => setDark((d) => !d)}
          onSelectScan={onSelectScan}
          onSeeAll={onSeeAll}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}