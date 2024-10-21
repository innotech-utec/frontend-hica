<template>
  <v-container>
    <BackButton />

    <!-- Título de la página -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Usuarios</h2>
      </v-col>
    </v-row>

    <!-- Botón para añadir usuario -->
    <v-btn color="primary" class="add-user-btn" @click="$router.push({ name: 'users.create' })">
      <v-icon>mdi-plus</v-icon>
      Añadir Usuario
    </v-btn>

    <!-- Tabla de usuarios y veterinarios -->
    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Renderizar filas de usuarios y veterinarios -->
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.documento }}</td>
                <td>{{ user.nombre }}</td>
                <td>{{ user.apellido }}</td>
                <td>
                  <!-- Mostrar el ícono y el rol del usuario -->
                  <v-icon :color="getIconColor(user)">
                    {{ getIcon(user) }}
                  </v-icon>
                  {{ determineRole(user) }}
                </td>
                <td>
                  <!-- Editar usuario -->
                  <v-btn icon @click="$router.push({ name: 'users.edit', params: { id: user.id } })">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>

                  <!-- Eliminar usuario -->
                  <v-btn icon @click="confirmDeleteUser(user.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>
    <div class="pagination-container">
      <PaginatorComponent
        :length="totalPages"
        :currentPage="currentPage"
        @pageChange="handlePageChange"
      />
    </div>
  </v-container>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";
import BackButton from '@/shared/components/BackButton.vue';

export default {
  components: {
    BackButton,
    PaginatorComponent
  },
  data() {
    return {
      users: [], // Lista combinada de usuarios
      currentPage: 1,
      totalPages: 1,
      loading: false,
    };
  },
  methods: {
    // Método para obtener la lista de usuarios (NO MODIFICADO)
    async fetchUsers(page = 1) {
      this.loading = true;
      try {
        const response = await backend.get(`/usuarios?page=${page}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const responseVeterinarios = await backend.get(`/veterinarios`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Asumimos que `veterinario` ya viene del backend correctamente asignado
        this.users = response.data.data;
        const veterinarios = responseVeterinarios.data;

        // Agregar a cada usuario la información si es veterinario
        this.users.forEach(user => {
          const veterinarioAsociado = veterinarios.find(vet => vet.user.id === user.id);
          if (veterinarioAsociado) {
            user.veterinario = veterinarioAsociado; // Agrega el veterinario al usuario
          }
        });

        // Paginación
        this.currentPage = response.data.meta.current || 1;
        this.totalPages = response.data.meta.last || 1;

        console.log('Lista de usuarios:', this.users);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        Swal.fire('Error', 'No se pudo obtener la lista de usuarios', 'error');
      } finally {
        this.loading = false;
      }
    },

    // Determina el rol del usuario para mostrar en la tabla
    determineRole(user) {
      if (user.isAdmin && user.veterinario) return 'Administrador, Veterinario';
      if (user.isAdmin) return 'Administrador';
      if (user.veterinario) return 'Veterinario';
      return 'Usuario';
    },

    // Devuelve el ícono correspondiente al usuario según su rol
    getIcon(user) {
      if (user.isAdmin && user.veterinario) return 'mdi-shield-account';
      if (user.isAdmin) return 'mdi-shield-account';
      if (user.veterinario) return 'mdi-stethoscope'; // Ícono específico para veterinarios
      return 'mdi-account';
    },

    // Devuelve el color del ícono según el rol del usuario
    getIconColor(user) {
      if (user.isAdmin && user.veterinario) return '#014582';  // Azul para Admin + Veterinario
      if (user.isAdmin) return '#014582';  // Azul para Admin
      if (user.veterinario) return '#008575';  // Verde para Veterinario
      return '#A9A9A9';  // Gris para Usuario
    },

    // Confirmar eliminación de usuario
    async confirmDeleteUser(id) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, inhabilitar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        this.deleteUser(id);
      }
    },

    // Método para eliminar usuario
    async deleteUser(id) {
      try {
        await backend.delete(`/usuarios/${id}`);
        this.fetchUsers(); // Refresca la lista después de eliminar
        Swal.fire('Inhabilitado!', 'El usuario ha sido inhabilitado.', 'success');
      } catch (error) {
        console.error('Error al inhabilitar usuario:', error);
        Swal.fire('Error', 'No se pudo inhabilitar el usuario', 'error');
      }
    },

    handlePageChange(newPage) {
      this.fetchUsers(newPage);
    },
  },

  created() {
    // Llamar al método fetchUsers al crearse el componente
    this.fetchUsers();
  },
};
</script>

<style scoped>
.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 10px;
}

.table th {
  background-color: #f2f2f2;
  text-align: left;
}

.table td {
  text-align: left;
  vertical-align: middle;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .add-user-btn {
    width: 100%;
    margin-bottom: 10px;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .v-btn {
    width: 100%;
  }
}
</style>
