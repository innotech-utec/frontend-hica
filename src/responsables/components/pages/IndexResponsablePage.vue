<template>
  <v-container>
    <BackButton />

    <v-row class="justify-center">
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Propietarios</h2>
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
  @click:clear="handleClearFilter"
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
          @input="filtrarResponsables"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card-actions>
      <v-btn 
        rounded 
        color="primary" 
        class="add-user-btn" 
        dark 
        @click="showCreateModal = true"
      >
        <v-icon left>mdi-plus</v-icon>
        Añadir Propietario
      </v-btn>
    </v-card-actions>

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
                <td>{{ responsable.departamento?.nombre }}</td>
                <td>{{ localidadesNombres[responsable.id] || 'Cargando...' }}</td>
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

    <!-- Modal Crear Responsable -->
    <CreateResponsablePage
      v-model="showCreateModal"
      v-model:value="showCreateModal"
  @created="handleCreateSuccess"
/>
 
<ResponsableEdit
  v-if="showEditModal && selectedResponsableId"
  :show-modal="showEditModal"
      :responsable-id="selectedResponsableId"
      @close="handleEditClose"
    />

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
import CreateResponsablePage from './CreateResponsablePage.vue';
import ResponsableEdit from './EditResponsablePage.vue';
import { obtenerLocalidades } from '../../services/direccionesService';

export default {
  name: 'ResponsablesIndex',
  
  components: {
    BackButton,
    PaginatorComponent,
    CreateResponsablePage,
    ResponsableEdit,
  },

  data() {
    return {
      responsables: [],
      filtroDocumento: '',
      filtroApellido: '',
      currentPage: 1,
      totalPages: 1,
      loading: false,
      localidades: {},
      localidadesNombres: {},
      animalesResponsable: [],
      showCreateModal: false,
      showEditModal: false,
      showAnimalesModal: false,
      selectedResponsableId: null,
    };
  },

  computed: {
    responsablesFiltrados() {
    return this.responsables.filter(responsables => {
      
      const documentoFilter = this.filtroDocumento || '';
     
      const apellidoFilter = this.filtroApellido || '';

      const matchesDocumento = responsables.documento.toLowerCase()
        .includes(documentoFilter.toLowerCase());
      const matchesApellido = responsables.apellido.toLowerCase()
        .includes(apellidoFilter.toLowerCase());

      return matchesDocumento && matchesApellido;
      });
    }
  },
  
  methods: {
    handleCreateSuccess() {
    this.fetchResponsables(); 
    this.showCreateModal = false; // Cerrar el modal
  },


handleClearFilter(filterType) {
    if (filterType === 'documento') {
      this.filtroDocumento = '';
    } else if (filterType === 'apellido') {
      this.filtroApellido = '';
    }
    this.fetchResponsables(); 
  },

  filtrarResponsables() {
    
    if (!this.filtroDocumento && !this.filtroApellido) {
      this.fetchResponsables();
      return;
    }
    this.currentPage = 1;
  },


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

    // Actualizar localidades asociadas a cada responsable
    for (const responsable of this.responsables) {
      const departamentoNombre = responsable.departamento?.nombre;
      if (departamentoNombre) {
        try {
          const localidades = await obtenerLocalidades(departamentoNombre);
          const localidad = localidades.find(loc => loc.id === responsable.localidadId);
          this.localidadesNombres[responsable.id] = localidad ? localidad.nombre : 'No especificada';
        } catch (error) {
          console.error('Error al obtener localidad:', error);
          this.localidadesNombres[responsable.id] = 'No especificada';
        }
      }
    }

    this.currentPage = page;
  } catch (error) {
    console.error('Error al obtener responsables:', error);
    Swal.fire('Error', 'No se pudo obtener la lista de responsables.', 'error');
  } finally {
    this.loading = false;
  }
},

    getDepartamentoNombre(responsable) {
      return responsable.departamento?.nombre || 'No especificado';
    },
    async getLocalidadNombre(responsable) {
      if (!this.localidadesNombres[responsable.id]) {
        try {
          const localidades = await obtenerLocalidades(responsable.departamento.nombre);
          const localidad = localidades.find(loc => loc.id === responsable.localidadId);
          this.localidadesNombres[responsable.id] = localidad ? localidad.nombre : 'No especificada';
        } catch (error) {
          console.error('Error al obtener localidad:', error);
          this.localidadesNombres[responsable.id] = 'No especificada';
        }
      }
      return this.localidadesNombres[responsable.id];
    },
  

    editResponsable(id) {
  this.selectedResponsableId = id;
  this.showEditModal = true;
},


handleEditClose() {
  this.showEditModal = false;
  this.selectedResponsableId = null;
  this.fetchResponsables(this.currentPage);
},
    handleEditSuccess() {
      this.showEditModal = false;
      this.selectedResponsableId = null;
      this.fetchResponsables();
    },
 
    async deleteResponsable(id) {
  try {
    await backend.delete(`/responsables/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    await Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'El propietario ha sido eliminado correctamente.',
    });
    
    await this.fetchResponsables(this.currentPage);
  } catch (error) {
    console.error('Error al eliminar propietario:', error);
    
    if (error.response?.data?.message?.includes('animales')) {
      await Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
        text: 'El propietario tiene animales asignados. Debe eliminar los animales antes de eliminar al propietario.',
      });
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el propietario.',
      });
    }
  }
},


    async confirmDeleteResponsable(id) {
  try {
    // Verificar si tiene animales asignados
    const response = await backend.get(`/responsables/${id}/animales`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data && response.data.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
        text: 'El propietario tiene animales asignados. Debe eliminar los animales antes de eliminar al propietario.',
      });
      return;
    }

    // Si no tiene animales, mostrar confirmación
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
      await this.deleteResponsable(id);
    }
  } catch (error) {
    console.error('Error al verificar animales:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo verificar los animales del propietario.',
    });
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

    handlePageChange(newPage) {
      this.currentPage = newPage;
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