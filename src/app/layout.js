// src/app/layout.js
'use client';

import './globals.css';
import Sidebar from './components/Sidebar';
import useAuthStore from './store/authStore';
import LoginPage from './login/page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function RootLayout({ children }) {
  
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    // 초기 로딩 시 로그인 페이지가 아닌 다른 페이지에 접근했을 때
    // 로그인 상태가 아니면 로그인 페이지로 리디렉션

    console.log('isLoggedIn : ' + isLoggedIn);
    console.log(router);
    console.log('router.pathname : ' + router.pathname);

    if (!isLoggedIn && router.pathname !== '/login') {
    
      router.push('/login');

    }

    console.log(children);
  
  }, [isLoggedIn, router]);


  return (
    <html lang="en">
      <body>
        {isLoggedIn ? (
          <div className="container">
            <Sidebar />
            <main>{children}</main>
          </div>
        ) : (
          <LoginPage />
        )}
      </body>
    </html>
  );
}