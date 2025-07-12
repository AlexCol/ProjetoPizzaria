'use client';

import HomeMain from "./home/components/HomeMain/HomeMain";
import HomeSide from "./home/components/HomeSide/HomeSide";
import useHomeStates from "./home/home.states";

export default function Home() {
  const states = useHomeStates();

  return (
    <div className={mainTailwindClass}>
      <HomeSide homeStates={states} />
      <HomeMain homeStates={states} />
    </div>
  );
}

const mainTailwindClass = `
  flex
  flex-row
  bg-gray-100
  dark:bg-gray-800
  transition-colors
  duration-300
  h-full
`;