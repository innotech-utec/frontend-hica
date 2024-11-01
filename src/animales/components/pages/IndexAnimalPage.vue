<template>
  <v-container>
    <!-- Botón de regreso -->
    <BackButton />
  
    <!-- Título del formulario -->
    <v-row>
    </v-row>

    <!-- Filtros de búsqueda -->
    <v-row class="filter-row" justify="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filtroDocumento"
          label="Documento Responsable"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          @click:append="filtrarAnimales"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filtroNombre"
          label="Nombre del Paciente"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          @click:append="filtrarAnimales"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Tabla de animales -->
    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento Responsable</th>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Peso (kg)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="animalesFiltrados.length === 0 && !loading">
                <td colspan="8" class="text-center">No hay animales registrados.</td>
              </tr>
              <tr v-for="animal in animalesFiltrados" :key="animal.id">
                <td>{{ animal.responsable ? `${animal.responsable.documento}` : 'Sin responsable' }}</td>
                <td>{{ animal.nombre }}</td>
                <td>{{ animal.especie }}</td>
                <td>{{ animal.raza }}</td>
                <td>{{ animal.edad }}</td>
                <td>{{ animal.sexo }}</td>
                <td>{{ animal.peso }}</td>
                <td>
                  <v-card-actions>
                    <v-btn icon @click="openEditModal(animal)" title="Editar animal">
                      <v-icon>mdi-pencil-outline</v-icon>
                    </v-btn>
                    <v-btn icon color="success" @click="checkOpenFichas(animal.id)" title="Crear ficha clínica">
                      <v-icon>mdi-file-plus-outline</v-icon>
                    </v-btn>
                    <v-btn icon color="warning" @click="viewOpenFichas(animal.id)" title="Ver fichas clínicas abiertas">
                      <v-icon>mdi-file-eye-outline</v-icon>
                    </v-btn>
                    <v-btn color="primary" outlined @click="goToHistoriaClinica(animal.id)" title="Ver historia clínica">
                      <v-icon>mdi-file-document-multiple-outline</v-icon>
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

    <!-- Modal de edición de animal -->
    <EditAnimalPage
      v-if="showEditModal"
      :showModal="showEditModal"
      :animalData="animalSeleccionado"
      @close="closeEditModal"
      @updated="fetchAnimales"
    />
  </v-container>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import EditAnimalPage from "@/animales/components/pages/EditAnimalPage.vue";
import BackButton from '@/shared/components/BackButton.vue';
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {
  components: {
    BackButton,
    EditAnimalPage,
    PaginatorComponent
  },
  data() {
    return {
      animales: [],
      animalSeleccionado: {},
      filtroDocumento: '',
      filtroNombre: '',
      currentPage: 1,
      totalPages: 1,
      loading: false,
      showEditModal: false
    };
  },
  computed: {
    animalesFiltrados() {
      return this.animales.filter(animal => {
        const matchesDocumento = animal.responsable?.documento.includes(this.filtroDocumento);
        const matchesNombre = animal.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
        return matchesDocumento && matchesNombre;
      });
    }
  },
  methods: {
    async fetchAnimales() {
      this.loading = true;
      try {
        const response = await backend.get("/animales", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (Array.isArray(response.data)) {
          this.animales = response.data;
          this.totalPages = Math.ceil(response.data.length / 10);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: "Los datos de animales no se encuentran en la estructura esperada.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener la lista de animales.",
        });
      } finally {
        this.loading = false;
      }
    },

    filtrarAnimales() {
      this.currentPage = 1;
      this.fetchAnimales();
    },

    async checkOpenFichas(animalId) {
      try {
        const response = await backend.get(`/fichasClinicas/abiertas/${animalId}`);
        const fichasAbiertas = response.data;

        if (fichasAbiertas.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Ficha Clínica Abierta',
            text: 'Este animal ya tiene una ficha clínica abierta. No se puede crear una nueva.',
          });
        } else {
          this.registerFichaClinica(animalId);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo obtener las fichas clínicas.',
        });
      }
    },

    registerFichaClinica(animalId) {
      this.$router.push({ name: 'fichaClinica.create', query: { animalId: animalId } });
    },

    async viewOpenFichas(animalId) {
      try {
        const response = await backend.get(`/fichasClinicas/abiertas/${animalId}`);
        const fichasAbiertas = response.data;

        if (fichasAbiertas.length > 0) {
          this.$router.push({ name: 'fichaClinica.view', query: { fichaClinicaId: fichasAbiertas[0].id, animalId: animalId } });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sin Fichas Clínicas Abiertas',
            text: 'Este animal no tiene fichas clínicas abiertas.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo obtener las fichas clínicas.',
        });
      }
    },

    viewHistoriaClinica(animalId) {
      this.$router.push({ name: 'historiaClinica.view', params: { id: animalId } });
    },

    openEditModal(animal) {
      this.animalSeleccionado = animal;  // Asigna el animal a editar
      this.showEditModal = true;     // Muestra el modal
    },
    closeEditModal() {
      this.showEditModal = false;    
      this.animalSeleccionado = null;    
    },
    goToHistoriaClinica(animalId) {
      this.$router.push({ name: 'historiaClinica.view', params: { animalId } });
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
      this.fetchAnimales();
    },
    
  },
  created() {
    this.fetchAnimales();
  }
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

.filter-row {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px;
  }
}
/* Estilo para el logo */
.logo {
  width: 150px;
  display: block;
  margin: 0 auto;
}

</style>
