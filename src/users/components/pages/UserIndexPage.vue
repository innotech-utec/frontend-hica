<template>
    <div class="user-index-container">
      <div class="header">
        <!-- Botón para redirigir al modal de añadir usuario en CreateUserPage -->
        <v-btn rounded variant="tonal" color="grey" class="add-user-btn" @click="$router.push({ name: 'users.create' })">
          <v-icon>mdi-plus</v-icon>
          Añadir usuario
        </v-btn>
      </div>
  
      <!-- Lista de usuarios con icono de veterinario o administrador -->
      <div class="user-list">
        <v-row>
          <v-col v-for="(user, index) in users" :key="index" cols="12" md="6" lg="4">
            <v-card class="mx-auto user-card" max-width="400">
              <v-card-title class="user-card-title">
                <v-icon left :color="user.isAdmin ? '#014582' : '#008575'">
                  <!-- Icono diferente para veterinarios y administradores -->
                  <template v-if="user.isAdmin">mdi-shield-account</template>
                  <template v-else>mdi-stethoscope</template> <!-- Icono para veterinarios -->
                </v-icon>
                {{ user.nombre }} {{ user.apellido }}
              </v-card-title>
              <v-card-subtitle>{{ user.email }}</v-card-subtitle>
              <v-card-subtitle>{{ user.documento }}</v-card-subtitle>
              <v-card-actions>
                <!-- Iconos de editar y eliminar -->
                <v-btn icon @click="editUser(user.id)" class="action-icon">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="deleteUser(user)" class="action-icon">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
  
        <!-- Paginación con flechas separadas -->
        <v-row class="mt-4">
          <v-col cols="12" class="text-center pagination-controls">
            <v-btn icon @click="fetchUsers(currentPage - 1)" :disabled="currentPage === 1">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="pagination-text">Página {{ currentPage }} de {{ totalPages }}</span>
            <v-btn icon @click="fetchUsers(currentPage + 1)" :disabled="currentPage === totalPages">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
  </template>
  
  <script>
  import backend from "@/backend.js";
  import Swal from "sweetalert2";
  
  export default {
    data() {
      return {
        users: [],
        currentPage: 1,
        totalPages: 1,
      };
    },
    methods: {
      async fetchUsers(page = 1) {
        try {
          const response = await backend.get("usuarios", { params: { page } });
          this.users = response.data.data;
          this.currentPage = response.data.meta.current;
          this.totalPages = response.data.meta.last;
        } catch (error) {
          this.users = [];
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al cargar la lista de usuarios",
          });
        }
      },
      editUser(userId) {
        this.$router.push(`/usuarios/${userId}/editar`);
      },
      async deleteUser(user) {
        const confirmDelete = await Swal.fire({
          title: "¿Estás seguro?",
          text: `¿Deseas eliminar a ${user.nombre} ${user.apellido}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });
  
        if (confirmDelete.isConfirmed) {
          try {
            await backend.delete(`usuarios/${user.id}`);
            Swal.fire("Eliminado", `${user.nombre} ha sido eliminado`, "success");
            this.fetchUsers(this.currentPage);
          } catch (error) {
            Swal.fire("Error", "Hubo un problema al eliminar el usuario", "error");
          }
        }
      },
    },
    created() {
      this.fetchUsers();
    },
  };
  </script>
  
  <style scoped>
  .user-index-container {
    padding: 20px;
  }
  .header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  .add-user-btn {
    background-color: #014582;
    color: #fff;
  }
  .add-user-btn:hover {
    background-color: #013262;
  }
  .user-card {
    border: 1px solid #014582;
    border-radius: 8px;
    padding: 16px;
    transition: box-shadow 0.3s ease;
  }
  .user-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .v-btn .v-icon {
    font-size: 18px;
  }
  .action-icon {
    color: #014582;
  }
  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pagination-text {
    margin: 0 16px;
    font-size: 16px;
  }
  </style>
  