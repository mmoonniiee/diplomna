import React from "react";

export default function Account(firstName, lastName) {
    const firstLetter = firstName[0];
    const [isClicked, setClicked] = useState(false);
    const toggleClick = () => setClicked(!isClicked);

    return (
        <div>
            <button onClick={toggleClick}>
                <span>${firstLetter}</span>
            </button>
            {isClicked && (
                <nav>
                    <div>
                        <p>${firstLetter}</p>
                    </div>
                    <p>${firstName} ${lastName}</p>
                    <button>Излизане</button>
                </nav>
            )}
        </div>
    )
}