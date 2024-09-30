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

    <!-- Tabla de usuarios -->
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
              <tr v-for="user in users" :key="user.id">
  <td>{{ user.documento }}</td>
  <td>{{ user.nombre }}</td>
  <td>{{ user.apellido }}</td>
  <td>
    <v-icon :color="user.isAdmin ? '#014582' : '#008575'">
      {{ user.isAdmin ? 'mdi-shield-account' : 'mdi-stethoscope' }}
    </v-icon>
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
      users: [], 
      currentPage: 1, 
      totalPages: 1,
      loading: false
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
      } finally {
        this.loading = false;  
      }
    },

    // Método para editar usuario
    editUser(id) {
      console.log("ID del usuario a editar:", id);  // Verifica el ID del usuario
      this.$router.push({ name: 'users.edit', params: { id } });
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
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        this.deleteUser(id);
      }
    },
    handlePageChange(newPage) {
      this.fetchUsers(newPage);
    },
    // Método para eliminar usuario
    async deleteUser(id) {
      try {
        await backend.delete(`/usuarios/${id}`);
        this.fetchUsers(); // Refresca la lista después de eliminar un usuario
        Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    },
  },

  created() {
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


@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .add-user-btn {
    width: 100%;
    margin-bottom: 10px;
    margin-bottom: 20px;
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


