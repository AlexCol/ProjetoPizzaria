import { HomeStates } from "../../home.states";
import homeMainStyles from "./homeMain.styles";

type HomeMainProps = {
  homeStates: HomeStates;
};

function HomeMain({ homeStates }: HomeMainProps) {
  const { counter, setCounter } = homeStates;
  const increase = () => setCounter(counter + 1);
  const reset = () => setCounter(0);
  const decrease = () => setCounter(counter - 1);

  function handleList() {
    let items: string[] = [];
    for (let i = 1; i <= counter; i++) {
      items.push(`Item ${i}`);
    }
    return items.map((item, index) => <li className={homeMainStyles.listaItem} key={index}>{item}</li>);
  }

  return (
    <div className={homeMainStyles.container}>
      <button className={homeMainStyles.menuButton} onClick={() => homeStates.setMenuHidden(!homeStates.menuHidden)}>
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
        <ul className={homeMainStyles.lista}>
          {handleList()}
        </ul>
      </div>
    </div>
  )
}

export default HomeMain