import { SelfAccountCard, SelfHeader, SelfLogoutButton, SelfThemeCard, useSelf } from '@/src/app-features/self';
import MyScrollView from '@/src/components/MyScrollView';

export default function Self() {
  const states = useSelf();

  if (!states.user) {
    return null;
  }

  return (
    <MyScrollView
      contentContainerStyle={states.styles.content}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <SelfHeader states={states} />
      <SelfAccountCard states={states} />
      <SelfThemeCard states={states} />
      <SelfLogoutButton states={states} />
    </MyScrollView>
  );
}
