<template>
  <v-container>
    <BackButton />

    <!-- Título de la página -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Responsables</h2>
      </v-col>
    </v-row>

    <!-- Botón para añadir responsable -->
    <v-btn color="primary" class="add-responsable-btn" @click="$router.push({ name: 'responsables.create' })">
      <v-icon>mdi-plus</v-icon>
      Añadir Responsable
    </v-btn>

    <!-- Tabla de responsables -->
    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Domicilio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="responsable in responsables" :key="responsable.id">
                <td>{{ responsable.documento }}</td>
                <td>{{ responsable.nombre }}</td>
                <td>{{ responsable.apellido }}</td>
                <td>{{ responsable.domicilio }}</td>
                <td>
                  <!-- Editar responsable -->
                  <v-btn icon @click="editResponsable(responsable.id)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>

                  <!-- Agregar animales -->
                  <v-btn icon @click="addAnimalToResponsable(responsable.id)">
                    <v-icon>mdi-paw</v-icon> <!-- Icono de animal para agregar animales -->
                  </v-btn>

                  <!-- Eliminar responsable -->
                  <v-btn icon @click="confirmDeleteResponsable(responsable.id)">
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
import backend from '@/backend'; // Asegúrate de que esta ruta esté bien definida
import Swal from 'sweetalert2';
import BackButton from '@/shared/components/BackButton.vue';
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {
  data() {
    return {
      responsables: [], // Array para almacenar los responsables
      currentPage: 1, // Página actual
      totalPages: 1,  // Total de páginas
    };
  },

  components: {
    BackButton,
    PaginatorComponent,
  },

  methods: {
    
    async fetchResponsables(page = 1) {
      console.log("Obteniendo lista de responsables para la página:", page); // Mostrar la página solicitada
      this.loading = true;

      try {
        // Hacer la solicitud al backend para obtener los responsables
        const response = await backend.get(`/responsables`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Asegúrate de que el token esté presente
          },
          params: {
            page, // Pasar el parámetro de la página como query param
          },
        });

        // Verificar que los datos existen en response.data
        console.log('Respuesta de /responsables:', response.data);

        if (response.data) {
          this.responsables = response.data; // Asignar los datos al array responsables
          this.currentPage = page; // Asignar la página actual
        } else {
          console.error('La respuesta no contiene los datos esperados.');
        }
      } catch (error) {
        console.error('Error al obtener responsables:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo obtener la lista de responsables.',
        });
      } finally {
        this.loading = false; // Desactivar el loading después de obtener los datos
      }
    },

    // Método para redirigir a la página de editar responsable
    editResponsable(id) {
      this.$router.push({ name: 'responsables.edit', params: { id } });
    },

    // Método para confirmar la eliminación de un responsable
    async confirmDeleteResponsable(id) {
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
        this.deleteResponsable(id);
      }
    },

    async deleteResponsable(id) {
      try {
        const response = await backend.delete(`/responsables/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        Swal.fire({
          title: "Responsable eliminado",
          text: response.data.message,
          icon: "success",
        });

        // Refresca la lista después de eliminar un responsable
        this.fetchResponsables(this.currentPage);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          Swal.fire({
            title: "Error",
            text: error.response.data.message,
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el responsable.",
            icon: "error",
          });
        }
      }
    },

    // Método para redirigir a la página de añadir un nuevo animal para un responsable
    addAnimalToResponsable(id) {
      this.$router.push({ name: 'animales.create', query: { responsableId: id } });
    },

    // Método para manejar el cambio de página
    handlePageChange(newPage) {
      this.fetchResponsables(newPage);
    },
  },

  // Cargar la lista de responsables cuando se monta el componente
  created() {
    this.fetchResponsables();
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

  .add-responsable-btn {
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
