import { useState } from "react";
import classnames from "classnames";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import reactLogo from "./assets/react.svg";

import "./globals.scss";
import styles from "./App.module.scss";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className={classnames(styles.logo, styles.react)}
            alt="React logo"
          />
        </a>
      </div>
      <h1>Rapide: a TypeScript + React template with Vite</h1>
      <div className={styles.card}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={styles.docs}>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
