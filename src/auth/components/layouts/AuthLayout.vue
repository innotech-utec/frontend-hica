<template>
    <div class="auth-layout">
      <nav class="layout-nav">
       
         <v-img
          src="@/assets/img/logo_hica.png"
          alt="Logo HICA"
          max-width="130"
          class="logo-hica"
        /> 
  
        <!-- Icono del usuario a la derecha -->
        <!-- <UserProfile /> -->
      </nav>
  
      <v-container>
        <router-view />
      </v-container>
    </div>
  </template>
  
  <script>
  // import UserProfile from '@/users/components/organisms/UserProfile.vue';
  
  export default {
    // components: {
    //   UserProfile
    // }
  };
  </script>
  
  <style scoped>
  .auth-layout {
    padding: 5px;  
    margin-top: 0;
  }
  
  .layout-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px; /* Reducir espacio entre íconos y contenido */
  }
  
  .logo-hica {
    margin-left: 10px; /* Ajuste más pequeño de margen */
  }
  
  
  </style>
  