// src/app/layout.js
'use client';

import './globals.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import useAuthStore from './store/authStore';
import LoginPage from './page/login/page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {parseCookies} from 'nookies';


export default function RootLayout({ children }) {
  
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    
    console.log('isLoggedIn : ' + isLoggedIn);
    console.log('router.pathname : ' + router.pathname);

    /*
    if (!isLoggedIn){// && router.pathname !== '/login') {
    
      router.push('/login');

    }
    */

    checkAuth();

  
  }, [isLoggedIn, router]);

  const checkAuth = async () => {

    const cookies = parseCookies();
    const token = cookies.token;

    console.log('main inside');
    console.log(cookies);
    console.log('token');
    console.log(token);
    
    if (!token) {
    
      router.push('/page/login');
      return;
    
    }

    checkAuth();

  };



  return (
    <html lang="en">
      <body style={{width:'100%', height:'100%'}}>
        {isLoggedIn ? (
          <div style={{display:'flex', flexDirection:'column'}}>
            <Header/>
            <div className="container" style={{width:'100%', height:'100%', backgroundColor:'white'}}>
              <Sidebar />
              <div style={{display:'flex', flex:1, flexDirection:'column', width:'100vh'}}>
                <main>{children}</main>
              </div>
            </div>
          </div>
 
        ) : (
          <LoginPage />
        )}
      </body>
    </html>
  );
}