import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from './components/Main';
import GameManager from './components/game/GameManager';
import GameClient from './components/game/GameClient';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Ranking from './components/Ranking';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main/>}></Route>
          <Route path='/ranking' element={<Ranking/>}></Route>
          <Route path='/gamemanager/:roomnumber' element={<GameManager/>}></Route>
          <Route path='/gameclient/:roomnumber' element={<GameClient/>}></Route>
          <Route path='/signup' element={<SignUp/>}></Route>
          <Route path='signin' element={<SignIn/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
