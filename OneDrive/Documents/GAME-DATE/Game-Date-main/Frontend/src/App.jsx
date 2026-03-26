import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar   from './components/Navbar';
import Landing  from './pages/Landing';
import Discover from './pages/Discover';
import Profile  from './pages/Profile';
import WelcomeScreen from './pages/WelcomeScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile"  element={<Profile />}  />
        <Route path="/welcome"  element={<WelcomeScreen />} />
      </Routes>

    </BrowserRouter>
  );
}
