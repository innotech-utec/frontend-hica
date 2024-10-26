import { createRouter, createWebHistory } from 'vue-router';
import { verifyTokenMiddleware } from './auth/middlewares/verifyTokenMiddleware.js';

// Páginas de Usuarios y Autenticación
import UserPage from '@/users/components/pages/UserIndexPage.vue';
import CreateUserPage from '@/users/components/pages/CreateUserPage.vue';
import EditUserPage from '@/users/components/pages/EditUserPage.vue';
import LoginPage from '@/auth/components/pages/LoginPage.vue';
import UnauthorizedPage from '@/auth/components/pages/UnauthorizedPage.vue';

// Páginas de Home y Layouts
import HomePage from '@/home/components/pages/HomePage.vue';
import AuthLayout from '@/auth/components/layouts/AuthLayout.vue';

// Páginas de Responsables
import ResponsablePage from '@/responsables/components/pages/IndexResponsablePage.vue';
import CreateResponsablePage from '@/responsables/components/pages/CreateResponsablePage.vue';
import EditResponsablePage from './responsables/components/pages/EditResponsablePage.vue';

// Páginas de Animales
import CreateAnimalPage from '@/animales/components/pages/CreateAnimalPage.vue';
import IndexAnimalPage from '@/animales/components/pages/IndexAnimalPage.vue';
import EditAnimalPage from './animales/components/pages/EditAnimalPage.vue';

// Páginas de Ficha Clínica
import CreateFichaClinicaPage from '@/animales/components/pages/CreateFichaClinicaPage.vue';
import ViewFichaClinicaPage from '@/animales/components/pages/ViewFichaClinicaPage.vue';
import EditFichaClinicaPage from './animales/components/pages/EditFichaClinicaPage.vue';

// Páginas de Tratamientos
import CreateTratamientoPage from '@/animales/components/pages/CreateTratamientoPage.vue';
import ViewTratamientoPage from '@/animales/components/pages/ViewTratamientoPage.vue';
import EditTratamientoPage from '@/animales/components/pages/EditTratamientoPage.vue';

// Páginas de Registro de Parámetros
import CreateParametrosPage from '@/animales/components/pages/CreateParametrosPage.vue';
import ViewRegistroParametrosPage from '@/animales/components/pages/ViewRegistroParametrosPage.vue';

// Páginas de Examen Objetivo
import CreateExamenObjetivoPage from '@/animales/components/pages/CreateExamenObjetivoPage.vue';
import ViewExamenObjetivoPage from '@/animales/components/pages/ViewExamenObjetivoPage.vue';
import EditExamenObjetivoPage from './animales/components/pages/EditExamenObjetivoPage.vue';


const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/',
    component: AuthLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/home',
        name: 'home',
        component: HomePage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/usuarios',
        name: 'users.index',
        component: UserPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/usuarios/crear',
        name: 'users.create',
        component: CreateUserPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/usuarios/:id/editar',
        name: 'users.edit',
        component: EditUserPage,
        meta: {
          requiresAuth: true,
        },
      },
      // Rutas para responsables
      {
        path: '/responsables',
        name: 'responsables.index',
        component: ResponsablePage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/responsables/crear',
        name: 'responsables.create',
        component: CreateResponsablePage,
        meta: {
          requiresAuth: true,
        },
      },

      {
        path: '/responsables/:id/editar',
        name: 'responsables.edit',
        component: EditResponsablePage,
        meta: {
          requiresAuth: true,
        },
      },
      // Rutas para animales
      {
        path: '/animales/crear',
        name: 'animales.create',
        component: CreateAnimalPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales',
        name: 'animales.index',
        component: IndexAnimalPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales/:id/editar',
        name: 'animales.edit',
        component: EditAnimalPage,
        meta: {
          requiresAuth: true,
        },
      },
      // Rutas para Fichas Clínicas
      {
        path: '/animales/ficha-clinica/crear',
        name: 'fichaClinica.create',
        component: CreateFichaClinicaPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales/ficha-clinica',
        name: 'fichaClinica.view',
        component: ViewFichaClinicaPage,
        meta: {
          requiresAuth: true,
        },
      },

      {
        path: '/fichasClinicas/:fichaClinicaId/editar',
        name: 'EditFichaClinica',
        component: EditFichaClinicaPage,
        meta: {
          requiresAuth: true,
        },
      },
      
      
      // Rutas para Tratamientos
      {
        path: '/animales/ficha-clinica/tratamiento/crear',
        name: 'tratamiento.create',
        component: CreateTratamientoPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales/ficha-clinica/tratamiento/editar/:tratamientoId',
        name: 'tratamiento.edit',
        component: EditTratamientoPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales/ficha-clinica/tratamiento',
        name: 'tratamiento.view',
        component: ViewTratamientoPage,
        meta: {
          requiresAuth: true,
        },
      },
      // Rutas para Registro de Parámetros
      {
        path: '/animales/ficha-clinica/parametros/crear',
        name: 'parametros.create',
        component: CreateParametrosPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales/ficha-clinica/parametros',
        name: 'parametros.view',
        component: ViewRegistroParametrosPage,
        meta: {
          requiresAuth: true,
        },
      },
      // Rutas para Examen Objetivo
      {
        path: '/animales/ficha-clinica/examen-objetivo/crear/:fichaClinicaId',
        name: 'examenObjetivo.create',
        component: CreateExamenObjetivoPage,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/animales/ficha-clinica/examen-objetivo',
        name: 'examenObjetivo.view',
        component: ViewExamenObjetivoPage,
        meta: {
          requiresAuth: true,
        },
        
      },
      {
        path: '/animales/ficha-clinica/examen-objetivo/editar/:fichaClinicaId',  // Nueva ruta para editar
        name: 'examenObjetivo.edit',
        component: EditExamenObjetivoPage,  // Asegúrate de tener este componente
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/403',
    name: '403',
    component: UnauthorizedPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware para verificar el token antes de cada cambio de ruta
router.beforeEach(verifyTokenMiddleware);

export { router };
