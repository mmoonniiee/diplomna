import React from "react";

export default function Menu() {
    const [isOpen, setOpen] = useState(false);
    const toggleMenu = () => setOpen(!isOpen);

    return (
        <div>
            <button onCLick={toggleMenu}>☰</button>
            {isOpen && (
                <nav>
                    <ul>
                        <li>
                            <a href="home">Начална Страница</a>
                        </li>
                        <li>
                            <a href="schedule">Седмично Разписание</a>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    )
}