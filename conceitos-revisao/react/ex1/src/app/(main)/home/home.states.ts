import { RefObject, useRef, useState } from "react";

export default function useHomeStates() {
  const [counter, setCounter] = useState(0);
  const [menuHidden, setMenuHidden] = useState(false);
  const listRef = useRef<HTMLUListElement>(null) as RefObject<HTMLUListElement>;
  const [isAutoScrollOn, setIsAutoScrollOn] = useState(true);

  function handleList() {
    let items: string[] = [];
    for (let i = 1; i <= counter; i++) {
      items.push(`Item ${i}`);
    }
    return items;
  }

  return {
    counter, setCounter,
    handleList,
    menuHidden, setMenuHidden,
    listRef,
    isAutoScrollOn, setIsAutoScrollOn
  };
}

export type HomeStates = ReturnType<typeof useHomeStates>;