<template>
  <v-container>
    <!-- Botón de regreso -->
    <BackButton />

    <!-- Título de la página -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Ficha Clínica del Animal</h2>
      </v-col>
    </v-row>

    <!-- Información básica del animal -->
    <v-row>
      <v-col cols="12" class="animal-info">
        <v-card class="mb-5">
          <v-card-title>Información del Animal</v-card-title>
          <v-card-text>
            <p><strong>Nombre:</strong> {{ animal.nombre }}</p>
            <p><strong>Especie:</strong> {{ animal.especie }}</p>
            <p><strong>Raza:</strong> {{ animal.raza }}</p>
            <p><strong>Edad:</strong> {{ animal.edad }}</p>
            <p><strong>Sexo:</strong> {{ animal.sexo }}</p>
            <p><strong>Peso:</strong> {{ animal.peso }} kg</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Información de la Ficha Clínica -->
    <v-row>
      <v-col cols="12" class="ficha-info">
        <v-card class="mb-5">
          <v-card-title>
            Detalles de la Ficha Clínica
            <!-- Botón de edición (lápiz) al lado del título -->
            <v-btn icon @click="editarFichaClinica(fichaClinica.id)">
              <v-icon color="#014582">mdi-pencil</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <p><strong>Motivo de Consulta:</strong> {{ fichaClinica.motivoConsulta }}</p>
            <p><strong>Condición Sanitaria:</strong> {{ fichaClinica.sanitaria }}</p>
            <p><strong>Condición Ambiental:</strong> {{ fichaClinica.ambiental }}</p>
            <p><strong>Remota Fisiológica:</strong> {{ fichaClinica.remotaFisiologica }}</p>
            <p><strong>Remota Patológica:</strong> {{ fichaClinica.remotaPatologica }}</p>
            <p><strong>Próxima Fisiológica:</strong> {{ fichaClinica.proximaFisiologica }}</p>
            <p><strong>Próxima Patológica:</strong> {{ fichaClinica.proximaPatologica }}</p>
            <p><strong>Estado del Paciente:</strong> {{ fichaClinica.estadoFichaClinica }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Otros componentes como examen objetivo, tratamiento, etc. -->
    <v-row>
      <v-col cols="12">
        <ViewExamenObjetivoPage :animalId="animal.id" :fichaClinicaId="fichaClinicaId" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <!-- Deshabilitar si el estado es Alta, Fallecimiento o Eutanasia -->
        <ViewTratamientoPage 
          :animalId="animal.id" 
          :fichaClinicaId="fichaClinicaId" 
          :disabled="isFichaClosed"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <!-- Deshabilitar si el estado es Alta, Fallecimiento o Eutanasia -->
        <ViewRegistroParametrosPage 
          :animalId="animal.id" 
          :fichaClinicaId="fichaClinicaId" 
          :disabled="isFichaClosed"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import BackButton from "@/shared/components/BackButton.vue";
import ViewExamenObjetivoPage from "@/animales/components/pages/ViewExamenObjetivoPage.vue";
import ViewTratamientoPage from "@/animales/components/pages/ViewTratamientoPage.vue";
import ViewRegistroParametrosPage from "@/animales/components/pages/ViewRegistroParametrosPage.vue";

export default {
  components: {
    BackButton,
    ViewExamenObjetivoPage,
    ViewTratamientoPage,
    ViewRegistroParametrosPage,
  },
  data() {
    return {
      animal: {},
      fichaClinicaId: null,
      fichaClinica: {}, 
    };
  },
  computed: {
    isFichaClosed() {
      // Si el estado es 'Alta', 'Fallecimiento' o 'Eutanasia', deshabilitar los botones
      const estadosCerrados = ['ALTA', 'FALLECIMIENTO', 'EUTANASIA'];
      return estadosCerrados.includes(this.fichaClinica.estadoFichaClinica);
    }
  },
  methods: {
    // Función para redirigir a la página de edición
    editarFichaClinica(fichaClinicaId) {
      if (fichaClinicaId) {
        this.$router.push({ name: 'EditFichaClinica', params: { fichaClinicaId: fichaClinicaId } });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró el ID de la ficha clínica.',
        });
      }
    },

    // Recarga los detalles del animal
    async fetchAnimalDetails() {
      const animalId = this.$route.query.animalId; 
      if (!animalId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se proporcionó un animal válido.",
        });
        return;
      }

      try {
        const response = await backend.get(`/animales/${animalId}`);
        this.animal = response.data;
      } catch (error) {
        console.error("Error al obtener los detalles del animal:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los detalles del animal.",
        });
      }
    },

    // Recarga los detalles de la ficha clínica
    async fetchFichaClinica() {
      const fichaClinicaId = this.$route.query.fichaClinicaId;
      if (!fichaClinicaId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se proporcionó una ficha clínica válida.",
        });
        return;
      }

      try {
        const response = await backend.get(`/fichasClinicas/${fichaClinicaId}`);
        this.fichaClinica = response.data;
        this.fichaClinicaId = fichaClinicaId;
      } catch (error) {
        console.error("Error al obtener la ficha clínica:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener la ficha clínica del animal.",
        });
      }
    },

    // Vuelve a cargar los datos cuando regresa desde la edición
    async refreshData() {
      await this.fetchAnimalDetails(); // Recarga los detalles del animal
      await this.fetchFichaClinica();  // Recarga los detalles de la ficha clínica
    }
  },

  created() {
    this.refreshData();  // Carga inicial de los datos
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

.animal-info {
  margin-bottom: 20px;
}

.mb-5 {
  margin-bottom: 20px;
}
</style>
