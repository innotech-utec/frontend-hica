<template>
  <v-container>
    <!-- Botón de regreso -->
    <BackButton />

    <!-- Título del formulario -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Listado de Animales</h2>
      </v-col>
    </v-row>

    <!-- Tabla de animales -->
    <v-row>
      <v-col cols="12">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Peso (kg)</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="animales.length === 0 && !loading">
                <td colspan="8" class="text-center">No hay animales registrados.</td>
              </tr>
              <tr v-for="animal in animales" :key="animal.id">
                <td>{{ animal.nombre }}</td>
                <td>{{ animal.especie }}</td>
                <td>{{ animal.raza }}</td>
                <td>{{ animal.edad }}</td>
                <td>{{ animal.sexo }}</td>
                <td>{{ animal.peso }}</td>
                <td>{{ animal.responsable ? `${animal.responsable.nombre} ${animal.responsable.apellido}` : 'Sin responsable' }}</td>
                <td>
                  <!-- Botón para editar animal -->
                  <v-btn icon @click="editAnimal(animal.id)" title="Editar animal">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>

                  <!-- Botón para registrar ficha clínica -->
                  <v-btn icon color="success" @click="checkOpenFichas(animal.id)" title="Crear ficha clínica">
                    <v-icon>mdi-plus-circle</v-icon>
                  </v-btn>

                  <!-- Botón para visualizar fichas clínicas abiertas -->
                  <v-btn icon color="warning" @click="viewOpenFichas(animal.id)" title="Ver fichas clínicas abiertas">
                    <v-icon>mdi-file-document</v-icon>
                  </v-btn>

                  <!-- Botón para visualizar historia clínica -->
                  <v-btn icon color="info" @click="viewHistoriaClinica(animal.id)" title="Ver historia clínica">
                    <v-icon>mdi-file-document</v-icon>
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
import BackButton from '@/shared/components/BackButton.vue';
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {
  data() {
    return {
      animales: [],  
      currentPage: 1, 
      totalPages: 1,
      loading: false, 
    };
  },

  components: {
    BackButton,
    PaginatorComponent
  },

  methods: {
    async fetchAnimales() {
      this.loading = true;

      try {
        const response = await backend.get('/animales', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, 
          }
        });

        if (Array.isArray(response.data)) {
          this.animales = response.data;
          this.totalPages = Math.ceil(response.data.length / 10);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Los datos de animales no se encuentran en la estructura esperada.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo obtener la lista de animales.',
        });
      } finally {
        this.loading = false; 
      }
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
         // Aquí te aseguras de que se está pasando correctamente el ID de la ficha clínica
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

    editAnimal(id) {
      this.$router.push({ name: 'animales.edit', params: { id } });
    },

    handlePageChange(newPage) {
      this.currentPage = newPage;
      this.fetchAnimales();
    }
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

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px;
  }
}
</style>
