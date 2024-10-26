<template>
  <v-container>
    <!-- Botón de regreso -->
    <BackButton />

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
            <v-card-actions>
              <!-- Botón para abrir el modal de edición -->
              <v-btn color="primary" @click="openEditModal" outlined>
                <v-icon left>mdi-pencil</v-icon> Editar Ficha Clínica
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para editar ficha clínica -->
    <v-dialog v-model="showEditModal" max-width="600px">
      <EditFichaClinicaPage
        :ficha-clinica-id="fichaClinicaId"
        @closeModal="closeEditModal"
        @fichaActualizada="refreshData"
      />
    </v-dialog>

    <!-- Otros componentes como examen objetivo, tratamiento, etc. -->
    <v-row>
      <v-col cols="12">
        <ViewExamenObjetivoPage :animalId="animal.id" :fichaClinicaId="fichaClinicaId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <ViewTratamientoPage :animalId="animal.id" :fichaClinicaId="fichaClinicaId" :disabled="isFichaClosed" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <ViewRegistroParametrosPage :animalId="animal.id" :fichaClinicaId="fichaClinicaId" :disabled="isFichaClosed" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import BackButton from "@/shared/components/BackButton.vue";
import EditFichaClinicaPage from "@/animales/components/pages/EditFichaClinicaPage.vue";  // Importamos el modal de edición
import ViewExamenObjetivoPage from "@/animales/components/pages/ViewExamenObjetivoPage.vue";
import ViewTratamientoPage from "@/animales/components/pages/ViewTratamientoPage.vue";
import ViewRegistroParametrosPage from "@/animales/components/pages/ViewRegistroParametrosPage.vue";

export default {
  components: {
    BackButton,
    EditFichaClinicaPage,  // Registramos el componente de edición como modal
    ViewExamenObjetivoPage,
    ViewTratamientoPage,
    ViewRegistroParametrosPage,
  },
  data() {
    return {
      animal: {},
      fichaClinicaId: null,
      fichaClinica: {},
      showEditModal: false,  // Controla si el modal está abierto o cerrado
    };
  },
  computed: {
    isFichaClosed() {
      const estadosCerrados = ['ALTA', 'FALLECIMIENTO', 'EUTANASIA'];
      return estadosCerrados.includes(this.fichaClinica.estadoFichaClinica);
    }
  },
  methods: {
    openEditModal() {
      this.showEditModal = true;  // Abre el modal
    },
    closeEditModal() {
      this.showEditModal = false;  // Cierra el modal
    },
    async refreshData() {
      await this.fetchAnimalDetails();
      await this.fetchFichaClinica();
    },
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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los detalles del animal.",
        });
      }
    },
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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener la ficha clínica del animal.",
        });
      }
    }
  },
  created() {
    this.refreshData();
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
