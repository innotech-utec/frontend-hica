<template>
  <v-container>

    <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Usuarios</h2>
        </v-col>
      </v-row>
    <!-- Botón de volver -->
    <v-btn icon @click="$router.push({ name: 'home' })" class="back-btn">
  <v-icon>mdi-arrow-left</v-icon>
</v-btn>

    <!-- Botón de Añadir Usuario -->
    <v-btn color="primary" class="add-user-btn" @click="$router.push({ name: 'users.create' })">
      <v-icon>mdi-plus</v-icon>
      Añadir Usuario
    </v-btn>

    <!-- Lista de usuarios -->
    <div class="user-list">
      <v-row>
        <v-col v-for="(user, index) in users" :key="index" cols="12" md="6" lg="4">
          <v-card class="mx-auto user-card" max-width="400">
            <v-card-title class="user-card-title">
              <v-icon left :color="user.isAdmin ? '#014582' : '#008575'">
                <template v-if="user.isAdmin">mdi-shield-account</template>
                <template v-else>mdi-stethoscope</template>
              </v-icon>
              {{ user.nombre }} {{ user.apellido }}
            </v-card-title>
            <v-card-subtitle>{{ user.email }}</v-card-subtitle>
            <v-card-subtitle>{{ user.documento }}</v-card-subtitle>
            <v-card-actions>
              <v-btn icon @click="editUser(user.id)" class="action-icon">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="confirmDeleteUser(user.id)" class="action-icon">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación correctamente ajustada -->
      <v-row class="mt-4">
        <v-col cols="12" class="text-center pagination-controls">
          <v-btn icon @click="fetchUsers(currentPage - 1)" :disabled="currentPage === 1" class="pagination-button">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <span class="pagination-text" style="margin: 0 15px;">Página {{ currentPage }} de {{ totalPages }}</span>
          <v-btn icon @click="fetchUsers(currentPage + 1)" :disabled="currentPage === totalPages" class="pagination-button">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      currentPage: 1,
      totalPages: 1,
      users: []
    };
  },
  methods: {
    async fetchUsers(page = 1) {
      try {
        const response = await backend.get(`/usuarios?page=${page}`);
        this.users = response.data.data;
        this.currentPage = response.data.meta.current;
        this.totalPages = response.data.meta.last;
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    },
    editUser(id) {
      this.$router.push({ name: 'users.edit', params: { id } });
    },
    async confirmDeleteUser(id) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        this.deleteUser(id);
      }
    },
    async deleteUser(id) {
      try {
        await backend.delete(`/usuarios/${id}`);
        this.fetchUsers(this.currentPage);
        Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.back-btn {
  position: absolute;
  top: 100px;
  left: 20px;
  z-index: 1000;
}

.add-user-btn {
  margin-bottom: 20px;
}

.user-list {
  margin-top: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-card-title {
  display: flex;
  align-items: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-button {
  margin-left: 10px;
  margin-right: 10px;
}
.form-title {
  font-size: 35px; /* Aumenta el tamaño */
  color: #014582; /* Azul oscuro que estás usando */
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
