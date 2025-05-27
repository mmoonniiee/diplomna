import React from 'react';
import Menu from './HamburgerMenu'
import Account from './Account';
import axios from 'axios';
import { Link, Outlet } from 'react-router';

export async function clientLoader({ params }) {
  const {data: school_name} = await axios.get(`http://localhost:5000/school/${params.schoolId}/name`);
  return school_name.name;
}

export default function Header({ loaderData }) {
  const school_name = loaderData;

  return (
    <div className='h-screen w-screen'>
      <header className='top-0 bg-[rgba(120,172,202,1)] w-full h-[8vh] flex justify-between items-center'>
        <div className="flex justify-start ml-6 w-1/3">
          <Menu />
        </div>
        <h2 className='text-white text-[20px] font-bold w-1/3 text-center'>{school_name}</h2>
        <div className='w-1/3'></div>
      </header>
      <div className='h-[92vh] w-full'>
        <Outlet />
      </div>
    </div>
  )
}