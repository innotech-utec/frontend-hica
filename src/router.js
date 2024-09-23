import { createRouter, createWebHistory } from 'vue-router';
import { verifyTokenMiddleware } from './auth/middlewares/verifyTokenMiddleware.js';
import UserPage from '@/users/components/pages/UserIndexPage.vue';
import CreateUserPage from '@/users/components/pages/CreateUserPage.vue';
import EditUserPage from '@/users/components/pages/EditUserPage.vue';
import LoginPage from '@/auth/components/pages/LoginPage.vue';
import UnauthorizedPage from '@/auth/components/pages/UnauthorizedPage.vue';
import HomePage from '@/home/components/pages/HomePage.vue';
import AuthLayout from '@/auth/components/layouts/AuthLayout.vue';

// Nuevas importaciones de las páginas de responsables
import ResponsablePage from '@/responsables/components/pages/IndexResponsablePage.vue';
import CreateResponsablePage from '@/responsables/components/pages/CreateResponsablePage.vue';


const routes = [
    {
        path: '/',
        redirect: '/login'  // Redirigir al login si no está autenticado
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage
    },
    {
        path: '/',
        component: AuthLayout,  // Aplica AuthLayout a todas las rutas hijas
        meta: { requiresAuth: true },
        children: [
            {
                path: '/home',
                name: 'home',
                component: HomePage,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: '/usuarios',
                name: 'users.index',
                component: UserPage,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: '/usuarios/crear',
                name: 'users.create',
                component: CreateUserPage,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: '/usuarios/:id/editar',
                name: 'users.edit',
                component: EditUserPage,
                meta: {
                    requiresAuth: true
                }
            },
            // Rutas para responsables
            {
                path: '/responsables',
                name: 'responsables.index',
                component: ResponsablePage,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: '/responsables/crear',
                name: 'responsables.create',
                component: CreateResponsablePage,
                meta: {
                    requiresAuth: true
                }
            },
         
        ]
    },
    {
        path: '/403',
        name: '403',
        component: UnauthorizedPage
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'  // Redirigir al login si la ruta no existe
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Middleware para verificar el token antes de cada cambio de ruta
router.beforeEach(verifyTokenMiddleware);

export { router };
