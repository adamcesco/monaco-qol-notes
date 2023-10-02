import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import reactLogo from './assets/react.svg';
import './App.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      greetMsg: '',
      name: '',
    };

    this.greet = this.greet.bind(this);
  }

  greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const { name } = this.state;
    invoke('greet', { name }).then((greetMsg) => {
      this.setState({ greetMsg });
    });
  }

  render() {
    const { greetMsg } = this.state;
    return (
      <div className="container">
        <h1>Welcome to Tauri!</h1>

        <div className="row">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src="/vite.svg" className="logo vite" alt="Vite logo" />
          </a>
          <a href="https://tauri.app" target="_blank" rel="noreferrer">
            <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
          </a>
          <a href="https://reactjs.org" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <p>Click on the Tauri, Vite, and React logos to learn more.</p>

        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            this.greet();
          }}
        >
          <input
            id="greet-input"
            onChange={(e) => this.setState({ name: e.target.value })}
            placeholder="Enter a name..."
          />
          <button type="submit">Greet</button>
        </form>

        <p>{greetMsg}</p>
      </div>
    );
  }
}

export default App;
