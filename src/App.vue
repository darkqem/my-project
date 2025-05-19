<template>
  <div id="app">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    
    <!-- Mobile header bar with conditional logout button -->
    <div v-if="!isLoginPage" class="mobile-header-bar">
      <div v-if="!isSidebarVisible && isMobile" class="sidebar-toggle-mobile">
        <button class="toggle-sidebar-btn-mobile" @click="toggleSidebar">→</button>
      </div>
      <!-- Only show logout button when sidebar is NOT visible on mobile -->
      <button v-if="!isSidebarVisible || !isMobile" class="logout-btn-top" @click="logout">Выйти</button>
    </div>
    
    <!-- Desktop logout button -->
    <button v-if="!isLoginPage && !isMobile" class="logout-btn-desktop" @click="logout">Выйти</button>
    
    <!-- Overlay when sidebar is open on mobile -->
    <div v-if="isSidebarVisible && !isLoginPage && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>
    
    <!-- Sidebar container -->
    <div class="sidebar-container" v-if="!isLoginPage" :class="{ 'sidebar-hidden': !isSidebarVisible, 'sidebar-mobile': isMobile }">
      <!-- Sidebar content -->
      <div class="sidebar">
        <!-- Close button for sidebar on mobile -->
        <button v-if="isMobile" class="close-sidebar-btn" @click="toggleSidebar">✕</button>
        <h1 class="sidebar-title">Карпулинг</h1>
        <ul>
          <li v-if="!isManagerRole"><router-link to="/drivers">Водители</router-link></li>
          <li v-if="!isManagerRole"><router-link to="/cars">Автомобили</router-link></li>
          <li v-if="!isManagerRole"><router-link to="/employees">Сотрудники</router-link></li>
          <li><router-link to="/passengers">Попутчики</router-link></li>
          <li><router-link to="/trips">Поездки</router-link></li>
        </ul>
        <h1 class="sidebar-title">Автосервис</h1>
        <ul>
          <li><router-link to="/clients">Клиенты</router-link></li>
          <li><router-link to="/repairs">Заказы</router-link></li>
          <li v-if="!isManagerRole"><router-link to="/cars_suppliers">Поставщики</router-link></li>
        </ul>
      </div>
    </div>
    
    <!-- Main content area -->
    <div :class="['content', { 'content-center': isLoginPage }]">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isSidebarVisible: true,
      isMobile: false
    }
  },
  computed: {
    isLoginPage() {
      return this.$route.path === '/login';
    },
    isManagerRole() {
      // Check if the current user is a manager
      const username = localStorage.getItem('username');
      return username === 'manager';
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.$router.push('/login');
    },
    toggleSidebar() {
      console.log('Toggling sidebar'); // Добавим отладочный вывод
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        this.isSidebarVisible = false;
      } else {
        this.isSidebarVisible = true;
      }
    },
    updateBodyClass() {
      if (this.isLoginPage) {
        document.body.classList.add('login-page');
      } else {
        document.body.classList.remove('login-page');
      }
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    this.updateBodyClass();
  },
  watch: {
    $route() {
      this.updateBodyClass();
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  }
};
</script>

<style>
/* Общие стили */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Базовые стили для предотвращения горизонтальной прокрутки */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  height: 100%;
}

#app {
  display: flex;
  min-height: 100vh;
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* Стили для бокового меню и контейнера */
.sidebar-container {
  display: flex;
  transition: transform 0.3s ease;
  position: relative;
  min-height: 100vh;
  height: 100%;
}

.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
  min-height: 100vh;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  z-index: 1100; /* Добавляем z-index для сайдбара */
}

.sidebar-hidden {
  transform: translateX(-250px);
}

.sidebar-title {
  font-family: "Microsoft JhengHei UI Light", "Microsoft JhengHei UI", sans-serif;
  font-weight: bold;
  color: #333;
  text-align: left;
  margin: 20px 0 15px;
  font-size: 1.5rem;
}

/* Стили для навигации */
ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin: 12px 0;
}

li a {
  display: block;
  padding: 10px;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

li a:hover {
  background-color: #e0e0e0;
}

li a.router-link-active {
  background-color: #2196F3;
  color: white;
}

/* Стили для основного контента */
.content {
  flex: 1;
  padding: 30px;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  margin-left: 250px; /* Match sidebar width */
}

.content-center {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
}

/* Медиа-запросы для адаптивности */
@media (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }
  
  .sidebar-hidden {
    transform: translateX(-220px);
  }
  
  .content {
    padding: 20px;
    margin-left: 220px;
  }
  
  .sidebar-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 80vw;
    max-width: 320px;
    min-width: 220px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1101;
    box-shadow: none;
  }
  .sidebar-hidden {
    transform: translateX(-100%);
  }
  .content {
    margin-left: 0;
    padding: 15px;
    width: 100%;
    padding-top: 65px; /* Increase top padding to avoid overlap with buttons */
  }
  .sidebar-toggle-desktop {
    display: none;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    max-width: 320px;
    min-width: 220px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1101;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }
  
  .sidebar-title {
    font-size: 1.2rem;
    margin: 15px 0 10px;
  }
  
  li {
    margin: 8px 0;
  }
  
  li a {
    padding: 8px;
    font-size: 14px;
  }
  
  .content {
    padding: 5px;
    padding-top: 60px; /* Add extra padding on top for mobile */
  }
  
  .content-center {
    padding: 15px;
  }
  
  .logout-btn-top {
    padding: 6px 12px;
    font-size: 12px;
    max-width: 100px;
  }
  
  .toggle-sidebar-btn-mobile {
    height: 35px;
    width: 35px;
    font-size: 20px;
  }

  /* Уменьшаем отступы у элементов */
  .content > * {
    margin-left: 0;
    margin-right: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Настройка изображений */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Настройка форм */
  input, select, textarea, button, table {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Горизонтальный скролл для таблиц */
  table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Поддержка свайпов для выпадающих списков */
  select {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }

  /* Общий стиль для всех контейнеров */
  div, form, section {
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
}

/* Стили для сенсорных устройств */
@media (hover: none) {
  li a:hover {
    background-color: transparent;
  }
  
  li a:active {
    background-color: #e0e0e0;
  }
}

/* Стили для темной темы */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background-color: #1e1e1e;
  }
  
  .sidebar-title {
    color: #ffffff;
  }
  
  li a {
    color: #ffffff;
  }
  
  li a:hover {
    background-color: #2d2d2d;
  }
  
  li a.router-link-active {
    background-color: #1976D2;
  }
}

.sidebar-container.sidebar-mobile {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 80vw;
  max-width: 320px;
  z-index: 1100;
  box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  background: transparent;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  overflow: hidden;
}

.sidebar-toggle-mobile {
  position: relative;
  z-index: 1200;
}

.toggle-sidebar-btn-mobile {
  height: 40px;
  width: 40px;
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-sidebar-btn-mobile:hover {
  background: #1976D2;
}

/* Удаляем старые стили для desktop кнопки */
.sidebar-toggle-desktop,
.toggle-sidebar-btn-desktop {
  display: none;
}

/* Медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
  .content {
    padding: 15px;
    width: 100%;
    margin-left: 0;
    padding-top: 65px; /* Increase top padding to avoid overlap with buttons */
  }

  .sidebar-container.sidebar-mobile {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 85%;
    max-width: 300px;
    z-index: 1100;
  }

  /* Убираем горизонтальные отступы у элементов внутри контента */
  .content > * {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Настройка таблиц для мобильных устройств */
  table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 5px;
  }

  /* Уменьшаем отступы у элементов */
  .content > * {
    margin-left: 0;
    margin-right: 0;
  }

  /* Настройка изображений */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Настройка форм */
  input, select, textarea {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Поддержка свайпов для выпадающих списков */
  select {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }
}

/* Стили для предотвращения горизонтальной прокрутки при открытом меню */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  overflow: hidden;
}

/* Дополнительные стили для элементов внутри сайдбара */
.sidebar {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Стили для контейнеров с фиксированной шириной */
.container {
  width: 100%;
  max-width: 100%;
  padding-left: 15px;
  padding-right: 15px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

/* Настройка flex-контейнеров */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
  width: 100%;
  box-sizing: border-box;
}

.col {
  flex: 1;
  padding-right: 15px;
  padding-left: 15px;
  box-sizing: border-box;
  max-width: 100%;
}

@media (max-width: 768px) {
  .row {
    margin-right: -10px;
    margin-left: -10px;
  }
  
  .col {
    padding-right: 10px;
    padding-left: 10px;
  }
}

/* Стиль для страницы логина, где нет сайдбара */
body.login-page .content {
  margin-left: 0;
}

/* Mobile header styles */
.mobile-header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1500;
  background-color: transparent;
  pointer-events: none; /* Важно: делаем контейнер прозрачным для кликов */
}

/* Но дочерние элементы могут получать клики */
.mobile-header-bar > * {
  pointer-events: auto;
}

.logout-btn-top {
  position: relative;
  z-index: 1500;
  padding: 8px 20px;
  background: #ff0000 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  transition: background 0.2s !important;
  width: auto;
  max-width: 120px;
}

.logout-btn-top:hover {
  background: #cc0000 !important;
}

@media (min-width: 769px) {
  .mobile-header-bar {
    display: none;
  }
  
  .logout-btn-top {
    position: fixed;
    top: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .logout-btn-top {
    padding: 6px 12px;
    font-size: 12px;
    max-width: 100px;
  }
}

/* Стили для кнопки закрытия сайдбара */
.close-sidebar-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  max-width: 40px;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.close-sidebar-btn:hover {
  background: #d32f2f;
}

@media (prefers-color-scheme: dark) {
  .close-sidebar-btn {
    background: #d32f2f;
  }
  
  .close-sidebar-btn:hover {
    background: #b71c1c;
  }
}

/* Desktop logout button styles */
.logout-btn-desktop {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  padding: 8px 20px !important;
  background: #da190b !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  transition: background 0.2s !important;
  z-index: 1500 !important;
}

.logout-btn-desktop:hover {
  background: #cc0000 !important;
}

@media (max-width: 768px) {
  .logout-btn-desktop {
    display: none;
  }
}
</style>
