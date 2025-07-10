'use client';

import { useState } from "react";
import homeStyles from "./home.styles";

export default function Home() {
  const [counter, setCounter] = useState(0);

  return (
    <div className={homeStyles.container}>
      <div className={homeStyles.counter}>{counter}</div>

      <div className={homeStyles.buttonArea}>
        <button className={homeStyles.increaseButton} onClick={() => setCounter(counter + 1)}>
          Aumentar
        </button>
        <button className={homeStyles.resetButton} onClick={() => setCounter(0)}>
          Resetar
        </button>
        <button className={homeStyles.decreaseButton} onClick={() => setCounter(counter - 1)}>
          Diminuir
        </button>
      </div>
    </div>
  );
}

