<template>
  <v-container>
    <!-- Botón de regreso -->
    <BackButton />

    <v-row class="justify-center">
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Usuarios</h2>
      </v-col>
    </v-row>

 
    <v-row class="filter-row" justify="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filtroDocumento"
          label="Documento de Identidad"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          @input="filtrarUsuarios"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filtroApellido"
          label="Apellido"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          @input="filtrarUsuarios"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-right">
        <v-card-actions>
          <v-btn rounded color="primary" class="add-user-btn" dark @click="$router.push({ name: 'users.create' })">
            <v-icon left>mdi-plus</v-icon>
            Añadir Usuario
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>


    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Documento de Identidad</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usuariosFiltrados.length === 0 && !loading">
                <td colspan="5" class="text-center">No hay usuarios registrados.</td>
              </tr>
              <tr v-for="user in usuariosFiltrados" :key="user.id">
                
                <td>{{ user.nombre }}</td>
                <td>{{ user.apellido }}</td>
                <td>{{ user.documento }}</td>
                <td>
                  <v-icon :color="getIconColor(user)">
                    {{ getIcon(user) }}
                  </v-icon>
                  {{ determineRole(user) }}
                </td>
                <td>
                  <v-card-actions>
                    <v-btn icon color="primary" @click="$router.push({ name: 'users.edit', params: { id: user.id } })">
                      <v-icon>mdi mdi-account-edit-outline</v-icon>
                    </v-btn>
                    <v-btn icon color="success" @click="confirmDeleteUser(user.id, !!user.veterinario)">
                      <v-icon>mdi mdi-delete-outline</v-icon>
                    </v-btn>
                  </v-card-actions>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>

    <!-- Paginación -->
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
    PaginatorComponent,
  },
  data() {
    return {
      users: [],
      filtroDocumento: '',
      filtroApellido: '',
      currentPage: 1,
      totalPages: 1,
      loading: false,
    };
  },
  computed: {
    usuariosFiltrados() {
      return this.users.filter(user => {
        const matchesDocumento = user.documento.includes(this.filtroDocumento);
        const matchesApellido = user.apellido.toLowerCase().includes(this.filtroApellido.toLowerCase());
        return matchesDocumento && matchesApellido;
      });
    }
  },
  methods: {
    async fetchUsers(page = 1) {
      this.loading = true;
      try {
        const response = await backend.get(`/usuarios?page=${page}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const responseVeterinarios = await backend.get(`/veterinarios`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        this.users = response.data.data;
        const veterinarios = responseVeterinarios.data;

        // Asocia el rol de veterinario a los usuarios que lo tienen
        this.users.forEach(user => {
          const veterinarioAsociado = veterinarios.find(vet => vet.user.id === user.id);
          if (veterinarioAsociado) {
            user.veterinario = veterinarioAsociado;
          }
        });

        this.currentPage = response.data.meta.current || 1;
        this.totalPages = response.data.meta.last || 1;
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        Swal.fire('Error', 'No se pudo obtener la lista de usuarios', 'error');
      } finally {
        this.loading = false;
      }
    },

    async confirmDeleteUser(id, isVeterinario) {
      // Verificación de eliminación de veterinario con tratamientos asignados
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
        if (isVeterinario) {
          try {
            // Verificar si el veterinario tiene tratamientos asignados
            const tratamientosResponse = await backend.get(`/veterinarios/${id}/tratamientos`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (tratamientosResponse.data.length > 0) {
              Swal.fire({
                icon: 'warning',
                title: 'Tratamientos asignados',
                text: 'Este veterinario tiene tratamientos asignados. Debes reasignar los tratamientos antes de inhabilitar al veterinario.',
              });
              return; // Detener la eliminación si hay tratamientos asignados
            }
          } catch (error) {
            console.error('Error al verificar tratamientos:', error);
            Swal.fire('Error', 'No se pudo verificar los tratamientos del veterinario.', 'error');
            return;
          }
        }
        
        // Proceder con la eliminación si no tiene tratamientos asignados
        this.deleteUser(id);
      }
    },

    async deleteUser(id) {
  try {
    await backend.delete(`/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    this.fetchUsers(); // Refresca la lista después de eliminar
    Swal.fire('Inhabilitado!', 'El usuario ha sido inhabilitado.', 'success');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Verifica si el error proviene de la relación de tratamientos asignados
      const errorMessage = error.response.data.message;
      if (errorMessage.includes('tratamientos asignados')) {
        Swal.fire('Error', 'Este veterinario tiene tratamientos asignados. Debes reasignar los tratamientos antes de inhabilitar al veterinario.', 'warning');
      } else {
        Swal.fire('Error', errorMessage || 'No se pudo inhabilitar el usuario', 'error');
      }
    } else {
      // Mensaje genérico para otros errores
      Swal.fire('Error', 'No se pudo inhabilitar el usuario', 'error');
    }
  }
},

    filtrarUsuarios() {
      this.currentPage = 1; // Reinicia la paginación al aplicar filtros
    },

    handlePageChange(newPage) {
      this.fetchUsers(newPage);
    },

    determineRole(user) {
      if (user.isAdmin && user.veterinario) return 'Administrador, Veterinario';
      if (user.isAdmin) return 'Administrador';
      if (user.veterinario) return 'Veterinario';
      return 'Usuario';
    },

    getIcon(user) {
      if (user.isAdmin && user.veterinario) return 'mdi-shield-account';
      if (user.isAdmin) return 'mdi-shield-account';
      if (user.veterinario) return 'mdi-stethoscope';
      return 'mdi-account';
    },

    getIconColor(user) {
      if (user.isAdmin && user.veterinario) return '#014582';
      if (user.isAdmin) return '#014582';
      if (user.veterinario) return '#008575';
      return '#A9A9A9';
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
  margin-top: 10px;
  margin-bottom: 10px;
}

.add-user-btn {
  background-color: #014582 !important;
  color: white !important;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fafafa;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.table th {
  background-color: #e8eaf6;
  color: #014582;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.filter-row {
  margin-bottom: 20px;
}
</style>
