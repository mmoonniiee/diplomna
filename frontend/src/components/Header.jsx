import React from 'react';
import Menu from './HamburgerMenu'
import Account from './Account';

export default function Header() {
    return (
        <header>
            <Menu />
            <h2>EDUTRACK</h2>
            <Account />
        </header>
    )
}