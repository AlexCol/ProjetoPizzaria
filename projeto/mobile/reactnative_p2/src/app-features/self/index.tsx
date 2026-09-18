import MyScrollView from '@/src/components/MyScrollView';
import SelfAccountCard from './components/SelfAccountCard';
import SelfHeader from './components/SelfHeader';
import SelfLogoutButton from './components/SelfLogoutButton';
import SelfThemeCard from './components/SelfThemeCard';
import useSelf from './useSelf';

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
