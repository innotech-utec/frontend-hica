<template>
  <v-container>
    <!-- Botón de regreso -->
    <BackButton />
    
    <!-- Título de la página -->
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
                <th>Edad</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Mostrar mensaje si no hay animales -->
              <tr v-if="animales.length === 0">
                <td colspan="5" class="text-center">No hay animales registrados.</td>
              </tr>

              <!-- Mostrar cada animal -->
              <tr v-for="animal in animales" :key="animal.id">
                <td>{{ animal.nombre }}</td>
                <td>{{ animal.especie }}</td>
                <td>{{ animal.edad }}</td>
                <td>{{ animal.responsable ? `${animal.responsable.nombre} ${animal.responsable.apellido}` : 'Sin responsable' }}</td>
                <td>
                  <!-- Botón para editar animal -->
                  <v-btn icon @click="editAnimal(animal.id)">
                    <v-icon>mdi-pencil</v-icon>
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
    // Método para obtener la lista de animales
    async fetchAnimales() {
      console.log("Obteniendo lista de animales..."); 
      this.loading = true;

      try {
        // Hacer la solicitud al backend para obtener los animales
        const response = await backend.get('/animales', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Asegúrate de que el token esté presente
          }
        });

        // Asignar la lista de animales a la variable `animales`
        console.log('Respuesta de /animales:', response.data);
        if (Array.isArray(response.data)) {
          this.animales = response.data;
        } else {
          console.warn('Los datos de animales no tienen la estructura esperada:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener la lista de animales:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo obtener la lista de animales.',
        });
      } finally {
        this.loading = false; 
      }
    },


    editAnimal(id) {
      this.$router.push({ name: 'animales.edit', params: { id } });
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
