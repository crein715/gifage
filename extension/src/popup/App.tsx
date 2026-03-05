import { useState } from 'react';
import Login from './pages/Login';
import Library from './pages/Library';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Library onLogout={() => setIsLoggedIn(false)} />;
}
