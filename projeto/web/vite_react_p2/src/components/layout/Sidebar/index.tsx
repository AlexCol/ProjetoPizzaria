'use client';

import SidebarFooter from './components/SidebarFooter';
import SideBarHeader from './components/SidebarHeader';
import SidebarMenu from './components/SideBarMenu';
import { sidebarStyles } from './sidebar.styles';
import useSidebar from './useSidebar';

export default function Sidebar() {
  const states = useSidebar();
  const { isCollapsed } = states;
  const className = `${sidebarStyles.containerTC} ${isCollapsed ? sidebarStyles.collapsedTC : sidebarStyles.expandedTC}`;

  return (
    <aside className={className}>
      {/* Header with Toggle Button */}
      <SideBarHeader states={states} />

      {/* Menu recursivo */}
      <SidebarMenu menuStates={states} />

      {/* Footer decorativo (opcional) */}
      <SidebarFooter states={states} />
    </aside>
  );
}
