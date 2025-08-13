'use client';

import Lottie from 'lottie-react';
import loadingAnimation from '@/lottie/pizza.loading.json';

export default function LoadingPizza() {
  return (
    <div className={constainerTailwindClass}>
      <Lottie className={animationTailwindClass} animationData={loadingAnimation} loop={true} />
    </div>
  );
}

const constainerTailwindClass = `
  flex
  items-center
  justify-center
  h-screen
  bg-gray-200
  dark:bg-gray-800
`;
const animationTailwindClass = `
  w-1/2
  h-1/2  
`;