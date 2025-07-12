import { HomeStates } from "../../home.states";
import homeMainStyles from "./homeMain.styles";
import { RefObject, useEffect, useRef } from "react";

type HomeMainProps = {
  homeStates: HomeStates;
};

function HomeMain({ homeStates }: HomeMainProps) {
  const { counter, setCounter, listRef, isAutoScrollOn, setIsAutoScrollOn, menuHidden, setMenuHidden } = homeStates;

  const increase = () => setCounter(counter + 1);
  const reset = () => setCounter(0);
  const decrease = () => setCounter(counter - 1);

  useEffect(() => {
    if (isAutoScrollOn && counter > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [counter]);

  function handleList() {
    let items: string[] = [];
    for (let i = 1; i <= counter; i++) {
      items.push(`Item ${i}`);
    }
    return items.map((item, index) => <li className={homeMainStyles.listaItem} key={index}>{item}</li>);
  }

  return (
    <div className={homeMainStyles.container}>
      <button className={homeMainStyles.menuButton} onClick={() => setMenuHidden(!menuHidden)}>
        Toggle Menu
      </button>

      <div className={homeMainStyles.counter}>{counter}</div>

      <div className={homeMainStyles.buttonArea}>
        <button className={homeMainStyles.increaseButton} onClick={increase}>
          Aumentar
        </button>
        <button className={homeMainStyles.resetButton} onClick={reset}>
          Resetar
        </button>
        <button className={homeMainStyles.decreaseButton} onClick={decrease}>
          Diminuir
        </button>
      </div>

      <div className={homeMainStyles.listaArea}>
        <ul className={homeMainStyles.lista} ref={listRef}>
          {handleList()}
        </ul>
      </div>

      <button className={homeMainStyles.autoScrollButton} onClick={() => setIsAutoScrollOn(!isAutoScrollOn)}>
        Auto Scroll
      </button>
      <p>{isAutoScrollOn ? "Auto Scroll is ON" : "Auto Scroll is OFF"}</p>
    </div>
  )
}

export default HomeMain