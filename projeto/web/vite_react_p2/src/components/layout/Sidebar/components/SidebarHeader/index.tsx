import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { useSidebarType } from '../../useSidebar';
import { sidebarHeaderStyles } from './sidebar-header.styles';

type SideBarHeaderProps = {
  states: useSidebarType;
};

function SideBarHeader(props: SideBarHeaderProps) {
  const { isCollapsed, toggleSidebar } = props.states;
  return (
    <div className={sidebarHeaderStyles.headerTC}>
      <button
        type='button'
        onClick={toggleSidebar}
        className={sidebarHeaderStyles.toggleButtonTC}
        title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        <div className='transition-transform duration-300'>
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </div>
      </button>
      {!isCollapsed && <h2 className={`${sidebarHeaderStyles.titleTC}`}>Pizzaria Coletti</h2>}
    </div>
  );
}

export default SideBarHeader;
