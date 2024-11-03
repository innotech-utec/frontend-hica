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
          <v-card-title class="section-title">Información del Animal</v-card-title>
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
          <v-card-title class="section-title">Detalles de la Ficha Clínica</v-card-title>
          <v-card-text>
            <p><strong>Motivo de Consulta:</strong> {{ fichaClinica.motivoConsulta }}</p>
            <p><strong>Condición Sanitaria:</strong> {{ fichaClinica.sanitaria }}</p>
            <p><strong>Condición Ambiental:</strong> {{ fichaClinica.ambiental }}</p>
            <p><strong>Estado del Paciente:</strong> {{ fichaClinica.estadoFichaClinica }}</p>
            <v-card-actions>
              <!-- Botón para editar ficha clínica -->
              <v-btn color="primary" @click="openEditModal" outlined>
                <v-icon left>mdi-pencil</v-icon> Editar Ficha Clínica
              </v-btn>
              <!-- Botón para facturación -->
              <v-btn 
                color="primary" 
                class="ml-2" 
                @click="irAFacturacion"
              >
                <v-icon left>mdi-currency-usd</v-icon>{{ facturaExistente ? 'Visualizar Factura' : 'Nueva Factura' }}
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modulos de Examen Objetivo, Tratamientos y Parámetros -->
    <v-row>
      <v-col cols="12">
        <ViewExamenObjetivoPage :animalId="animal.id" :fichaClinicaId="fichaClinicaId" :disabled="isFichaClosed" />
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

    <!-- Modal para editar ficha clínica -->
    <v-dialog v-model="showEditModal" max-width="600px">
      <EditFichaClinicaPage
        :ficha-clinica-id="fichaClinicaId"
        @closeModal="closeEditModal"
        @fichaActualizada="refreshData"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import BackButton from "@/shared/components/BackButton.vue";
import EditFichaClinicaPage from "@/animales/components/pages/EditFichaClinicaPage.vue";
import ViewExamenObjetivoPage from "@/animales/components/pages/ViewExamenObjetivoPage.vue";
import ViewTratamientoPage from "@/animales/components/pages/ViewTratamientoPage.vue";
import ViewRegistroParametrosPage from "@/animales/components/pages/ViewRegistroParametrosPage.vue";

export default {
  components: {
    BackButton,
    EditFichaClinicaPage,
    ViewExamenObjetivoPage,
    ViewTratamientoPage,
    ViewRegistroParametrosPage,
  },
  data() {
    return {
      animal: {},
      fichaClinicaId: null,
      fichaClinica: {},
      showEditModal: false,
      facturaExistente: false,
      facturaId: null
    };
  },
  computed: {
    isFichaClosed() {
      const estadosCerrados = ['Alta', 'Fallecimiento', 'Eutanasia'];
      return estadosCerrados.includes(this.fichaClinica.estadoFichaClinica);
    }
  },
  methods: {
    async verificarFactura() {
      try {
        const response = await backend.post('/facturas/createOrGet', { fichaClinicaId: this.fichaClinicaId });
        if (response.data && response.data.id) {
          this.facturaId = response.data.id;
          this.facturaExistente = true;
        }
      } catch (error) {
        console.error("Error al verificar la factura:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener la factura.",
        });
      }
    },
    async irAFacturacion() {
      if (this.facturaExistente) {
        // Redirige a la factura existente
        this.$router.push({
          name: 'IndexFacturaPage',
          params: { fichaClinicaId: this.fichaClinicaId, facturaId: this.facturaId }
        });
      } else {
        // Crea una nueva factura si no existe
        try {
          const response = await backend.post('/facturas/createOrGet', { fichaClinicaId: this.fichaClinicaId });
          this.facturaId = response.data.id;
          this.facturaExistente = true;
          this.$router.push({
            name: 'IndexFacturaPage',
            params: { fichaClinicaId: this.fichaClinicaId, facturaId: this.facturaId }
          });
        } catch (error) {
          console.error("Error al crear la factura:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo crear la factura.",
          });
        }
      }
    },
    openEditModal() {
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async refreshData() {
      await this.fetchAnimalDetails();
      await this.fetchFichaClinica();
      await this.verificarFactura(); // Verifica o crea la factura después de cargar la ficha clínica
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
  async created() {
    await this.refreshData();
  }
};
</script>

<style scoped>
.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-title {
  font-size: 20px;
  color: #014582;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}

.animal-card, .ficha-card {
  background-color: #f9f9f9;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #ddd;
  color: #333;
  padding: 16px;
}

.v-btn.primary {
  background-color: #014582;
  color: #fff;
}

.v-btn.primary:hover {
  background-color: #013262;
}

.mb-5 {
  margin-bottom: 20px;
}
</style>
