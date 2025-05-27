import { useState } from "react";

export async function homeRerout() {
  window.location.replace(`http://localhost:5000/home`);
}

export default function Menu() {
  const [isOpen, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!isOpen);

  return (
    <div className="relative">
      <button onClick={toggleMenu} className="text-white text-[24px]">☰</button>
      {isOpen && (
        <nav className="absolute right-0 bg-[rgba()]">
          <ul>
            <li>
              <p onClick={homeRerout} className="absolute bg-[rgba(217,217,217,0.4)] text-white p-4 rounded-lg cursor-pointer">Начална страница</p>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}