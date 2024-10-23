<template>
  <v-container class="home-container" fluid>
    <!-- Cabecera con el logo de HICA -->
   
  

    <div class="layout-wrapper">
      <!-- Barra lateral -->
      <nav class="sidebar">
        <ul class="sidebar-menu">
          <li class="sidebar-item">
            <v-icon left>mdi-account</v-icon>
            <router-link to="/responsables">Responsables</router-link>
          </li>
          <li class="sidebar-item">
            <v-icon left>mdi-account-group</v-icon>
            <router-link to="/usuarios">Usuarios</router-link>
          </li>
          <li class="sidebar-item">
            <v-icon left>mdi-paw</v-icon>
            <router-link to="/animales">Animales</router-link>
          </li>
          <li class="sidebar-item">
            <v-icon left>mdi-flask</v-icon>
            <router-link to="/laboratorio">Laboratorio</router-link>
          </li>
          <li class="sidebar-item">
            <v-icon left>mdi-cube-outline</v-icon>
            <router-link to="/insumos">Insumos</router-link>
          </li>
          <li class="sidebar-item">
            <v-icon left>mdi-file-chart</v-icon>
            <router-link to="/reportes">Reportes</router-link>
          </li>
        </ul>
      </nav>

      <!-- Contenido principal -->
      <div class="main-content">
        <!-- Aquí se cargará el contenido sin el logo -->
        <router-view></router-view>
      </div>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "HomePage",
};
</script>

<style scoped>
/* Estilo para la cabecera con el logo */
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  height: 100px;
  background-color: white;
  position: relative;
  z-index: 1000; /* Para asegurar que esté encima de la barra lateral */
  border-bottom: 1px solid #e0e0e0;
}

/* Barra lateral */
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #014582, #016ba3);
  padding-top: 20px;
  padding-left: 15px;
  padding-right: 15px;
  color: white;
  height: calc(100vh - 100px); /* Ajustar altura restando el tamaño de la cabecera */
  position: fixed;
  left: 0;
  top: 100px; /* Alineado justo debajo de la cabecera */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Estilo del menú de la barra lateral */
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Ítems del menú con mayor espaciado */
.sidebar-item {
  margin-bottom: 40px;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-item a {
  text-decoration: none;
  color: white;
  margin-left: 10px;
}

.sidebar-item:hover {
  cursor: pointer;
  color: #008575;
}

/* Layout principal */
.layout-wrapper {
  display: flex;
  margin-left: 250px;
  padding: 20px;
  background-color: #f0f4f8;
  height: calc(100vh - 100px); /* Ajuste del espacio restante para el contenido */
}
</style>
