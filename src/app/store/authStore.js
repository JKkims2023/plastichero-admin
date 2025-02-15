// store/authStore.js
import { create } from 'zustand';
import Cookies from 'js-cookie'; // js-cookie 라이브러리 import

const useAuthStore = create((set) => ({

  isLoggedIn: !!Cookies.get('token'), // 초기 로그인 상태 설정
  user: null,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  login: (userData) => {

    Cookies.set('token', userData.token);

    console.log('inside store login');
    console.log(userData);
    set({ isLoggedIn: true, user: userData });

  },
  logout: () => {

    console.log('inside store logout');
    console.log(Cookies);
    console.log('Cookies.get("token")', Cookies.get('token'));
    Cookies.remove('token');  
    set({ isLoggedIn: false, user: null });
  
  },
}));

export default useAuthStore;