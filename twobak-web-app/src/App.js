import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from './components/Main';
import GameManager from './components/game/GameManager';
import GameClient from './components/game/GameClient';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main/>}></Route>
          <Route path='/gamemanager' element={<GameManager/>}></Route>
          <Route path='/gameclient' element={<GameClient/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
