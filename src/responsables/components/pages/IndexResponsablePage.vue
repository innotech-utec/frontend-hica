<template>
  <v-container>
    
    <BackButton />

    <!-- Título de la página -->
    <v-row class="justify-center">
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Responsables</h2>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="filter-row" justify="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filtroDocumento"
          label="Documento"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          @input="filtrarResponsables"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Botón de Añadir Responsable -->
    <v-row>
      <v-col cols="12" class="text-left">
        <v-card-actions>
          <v-btn rounded color="primary" class="add-responsable-btn"  @click="$router.push({ name: 'responsables.create' })">
            <v-icon left>mdi-plus</v-icon>
            Añadir Responsable
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>

    <!-- Tabla de responsables -->
    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre y Apellido</th>
                <th>Domicilio</th>
                <th>Teléfono</th>
                <th>Departamento</th>
                <th>Localidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="responsablesFiltrados.length === 0 && !loading">
                <td colspan="7" class="text-center">No hay responsables registrados.</td>
              </tr>
              <tr v-for="responsable in responsablesFiltrados" :key="responsable.id">
                <td>{{ responsable.documento }}</td>
                <td>{{ responsable.nombre }} {{ responsable.apellido }}</td>
                <td>{{ responsable.domicilio }}</td>
                <td>{{ responsable.telefono }}</td>
                <td>{{ responsable.departamento.nombre }}</td>
                <td>{{ responsable.localidad }}</td>
                <td>
                  <v-card-actions>
                    <v-btn icon color="primary" @click="editResponsable(responsable.id)">
                      <v-icon>mdi mdi-account-edit-outline</v-icon>
                    </v-btn>
                    <v-btn icon color="success" @click="addAnimalToResponsable(responsable.id)">
                      <v-icon>mdi mdi-paw</v-icon>
                    </v-btn>
                    <v-btn icon color="info" @click="viewAnimales(responsable.id)">
                      <v-icon>mdi mdi-eye-outline</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click="confirmDeleteResponsable(responsable.id)">
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

  
    <v-dialog v-model="showAnimalesModal" max-width="600px">
      <v-card>
        <v-card-title class="headline">Animales de {{ currentResponsableNombre }}</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item
              v-for="animal in animalesResponsable"
              :key="animal.id"
              @click="goToAnimalHistory(animal.id)"
              class="clickable"
            >
              <v-list-item-content>
                <v-list-item-title>Nombre: {{ animal.nombre }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="showAnimalesModal = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';
import BackButton from '@/shared/components/BackButton.vue';
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {
  data() {
    return {
      responsables: [],
      filtroDocumento: '',
      currentPage: 1,
      totalPages: 1,
      loading: false,
      showAnimalesModal: false,
      animalesResponsable: [],
      currentResponsableNombre: '',
    };
  },

  components: {
    BackButton,
    PaginatorComponent,
  },

  computed: {
    responsablesFiltrados() {
      return this.responsables.filter(responsable => 
        responsable.documento.includes(this.filtroDocumento)
      );
    },
  },

  methods: {
    async fetchResponsables(page = 1) {
      this.loading = true;
      try {
        const response = await backend.get(`/responsables`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { page },
        });
        this.responsables = response.data;
        this.currentPage = page;
      } catch (error) {
        console.error('Error al obtener responsables:', error);
        Swal.fire('Error', 'No se pudo obtener la lista de responsables.', 'error');
      } finally {
        this.loading = false;
      }
    },

    editResponsable(id) {
      this.$router.push({ name: 'responsables.edit', params: { id } });
    },

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
        await backend.delete(`/responsables/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        Swal.fire('Eliminado', 'El responsable ha sido eliminado.', 'success');
        this.fetchResponsables(this.currentPage);
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el responsable.', 'error');
      }
    },

    addAnimalToResponsable(id) {
      this.$router.push({ name: 'animales.create', query: { responsableId: id } });
    },

    viewAnimales(id) {
      backend.get(`/responsables/${id}/animales`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(response => {
        this.animalesResponsable = response.data;
        this.currentResponsableNombre = response.data.nombre;
        this.showAnimalesModal = true;
      })
    },

    goToAnimalHistory(animalId) {
      this.$router.push({ name: 'historiaClinica.view', params: { animalId } });
    },

    filtrarResponsables() {
      this.currentPage = 1;
    },

    handlePageChange(newPage) {
      this.fetchResponsables(newPage);
    },
  },

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
  margin-top: 10px;
  margin-bottom: 10px;
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

.clickable {
  cursor: pointer;
}
</style>
