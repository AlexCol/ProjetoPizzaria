import type { useSidebarType } from '../../useSidebar';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';

type SidebarFooterProps = {
  states: useSidebarType;
};

export default function SidebarFooter({ states }: SidebarFooterProps) {
  const { userData } = useAuthContext();
  const userName = userData?.user?.name ? `${userData.user.name}` : 'Usuario';

  return (
    <div className={styles.footerTC}>
      <div
        className={`${styles.userNameTC} ${states.isCollapsed ? 'text-center w-full' : 'text-center w-full'}`}
        title={userName}
      >
        {states.isCollapsed ? userName.charAt(0).toUpperCase() : userName}
      </div>
    </div>
  );
}

const styles = {
  footerTC: `
    mt-auto
    h-14
    border-t
    border-border
    px-3
    flex
    items-center
    transition-colors
    duration-300
  `,
  userNameTC: `
    text-sm
    font-medium
    text-sidebar-foreground
    truncate
  `,
};
