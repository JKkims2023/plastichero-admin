// store/authStore.js
import { create } from 'zustand';
import Cookies from 'js-cookie'; // js-cookie 라이브러리 import

const useAuthStore = create((set) => ({

  isLoggedIn: !!Cookies.get('token'), // 초기 로그인 상태 설정
  user: null,
  login: (userData) => {
    set({ isLoggedIn: true, user: userData });
  },
  logout: () => {
    set({ isLoggedIn: false, user: null });
  },
}));

export default useAuthStore;