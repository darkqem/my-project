import { createRouter, createWebHistory } from 'vue-router';  // Используем новые функции для Vue 3
import DriverPage from '@/components/DriverPage.vue';
import EmployeePage from '@/components/EmployeePage.vue';
import PassengerPage from '@/components/PassengerPage.vue';
import TripPage from '@/components/TripPage.vue';
import CarsPage from '@/components/CarsPage.vue';
import ClientPage from '@/components/ClientPage.vue';
import RepairPage from '@/components/RepairPage.vue';
import SupplierPage from '@/components/SupplierPage.vue';
import LoginPage from '@/components/LoginPage.vue';

const routes = [
  { path: '/drivers', component: DriverPage, meta: { managerForbidden: true } },
  { path: '/employees', component: EmployeePage, meta: { managerForbidden: true } },
  { path: '/passengers', component: PassengerPage },
  { path: '/trips', component: TripPage },
  { path: '/cars', component: CarsPage, meta: { managerForbidden: true } },
  { path: '/clients', component: ClientPage },
  { path: '/repairs', component: RepairPage },
  { path: '/cars_suppliers', component: SupplierPage, meta: { managerForbidden: true } },
  { path: '/login', component: LoginPage },
  { path: '/', redirect: '/trips' }, // Изменен редирект на доступную страницу
];

const router = createRouter({
  history: createWebHistory(), // История для браузера
  routes
});

// Глобальный guard для авторизации
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const isManager = username === 'manager';

  // Редирект на логин, если нет токена
  if (authRequired && !token) {
    return next('/login');
  }
  
  // Если уже авторизован и пытается попасть на /login — редиректим на главную
  if (to.path === '/login' && token) {
    return next('/');
  }
  
  // Проверка прав доступа для менеджера
  if (isManager && to.meta.managerForbidden) {
    // Если менеджер пытается получить доступ к запрещенной странице
    return next('/trips'); // Редирект на доступную страницу
  }
  
  next();
});

export default router;
