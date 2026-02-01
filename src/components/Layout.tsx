import { ReactNode } from "react";

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function Layout({ sidebar, children }: LayoutProps): JSX.Element {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">Collector.shop</div>
        <div className="header-right">
          <span className="env-pill">ENV: local</span>
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">{sidebar}</aside>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
