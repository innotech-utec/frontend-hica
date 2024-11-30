<template>
  <v-container>
    <BackButton />

    <!-- <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="ficha-title">Ficha Clínica del Animal</h1>
      </v-col>
    </v-row> -->

    <!-- Información básica del animal -->
    <v-card class="mb-4" flat>
      <v-card-title class="info-title">Información del Animal</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Nombre:</label>
              <div class="field-value">{{ animal.nombre }}</div>
            </div>
            <div class="field-group">
              <label class="field-label">Especie:</label>
              <div class="field-value">{{ animal.especie }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Raza:</label>
              <div class="field-value">{{ animal.raza }}</div>
            </div>
            <div class="field-group">
              <label class="field-label">Edad:</label>
              <div class="field-value">{{ animal.edad }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Sexo:</label>
              <div class="field-value">{{ animal.sexo }}</div>
            </div>
            <div class="field-group">
              <label class="field-label">Peso:</label>
              <div class="field-value">{{ animal.peso }} kg</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Veterinarios asignados -->
    <v-card class="mb-4" flat>
    <v-card-title class="info-title d-flex justify-space-between align-center">
      Veterinarios Asignados
      <v-btn 
        color="primary"
        @click="openVeterinarioModal"
        :disabled="isFichaClosed"
      >
        <v-icon>mdi-plus</v-icon> Agregar Veterinario
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-row v-if="veterinariosAsignados.length > 0">
        <v-col 
          v-for="vet in veterinariosAsignados" 
          :key="vet.id"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="field-value">
            {{ vet.user.nombre }} {{ vet.user.apellido }}
          </div>
        </v-col>
      </v-row>
      <div v-else class="field-value">
        No hay veterinarios asignados
      </div>
    </v-card-text>
  </v-card>

  <!-- Modal para seleccionar veterinario -->
  <v-dialog v-model="showVeterinarioModal" max-width="500px">
    <v-card>
      <v-card-title>Seleccionar Veterinario</v-card-title>
      <v-card-text>
        <v-select
          v-if="!loadingVeterinarios"
          v-model="selectedVeterinario"
          :items="veterinariosDisponibles"
          item-title="nombre"
          item-value="id"
          label="Veterinario"
          :rules="[v => !!v || 'El veterinario es requerido']"
          required
        >
          <template v-slot:item="{ item, props }">
            <v-list-item
              v-bind="props"
              :title="item.raw.nombre"
            ></v-list-item>
          </template>
        </v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="asignarVeterinario">Agregar</v-btn>
        <v-btn color="secondary" @click="showVeterinarioModal = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

    <!-- Información de la Ficha Clínica -->
    <v-card class="mb-4" flat>
      <v-card-title class="info-title">Detalles de la Ficha Clínica</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="field-group">
              <label class="field-label">Motivo de Consulta</label>
              <div class="field-value">{{ fichaClinica.motivoConsulta }}</div>
            </div>
            <div class="field-group">
              <label class="field-label">Condición Sanitaria</label>
              <div class="field-value">{{ fichaClinica.sanitaria }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="field-group">
              <label class="field-label">Condición Ambiental</label>
              <div class="field-value">{{ fichaClinica.ambiental }}</div>
            </div>
            <div class="field-group">
              <label class="field-label">Estado del Paciente</label>
              <div class="field-value">{{ fichaClinica.estadoFichaClinica }}</div>
            </div>
          </v-col>
        </v-row>

        <!-- Botones -->
        <v-row class="mt-4">
          <v-col cols="12" class="d-flex justify-center">
            <v-btn color="primary" @click="openEditModal" class="mx-2">
              <v-icon left>mdi-pencil</v-icon> Editar Ficha Clínica
            </v-btn>
            <v-btn color="primary" @click="irAFacturacion" class="mx-2">
              <v-icon left>mdi-currency-usd</v-icon>
              {{ facturaExistente ? 'Visualizar Factura' : 'Nueva Factura' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
      facturaId: null,
      veterinariosAsignados: [],
      showVeterinarioModal: false,
      selectedVeterinario: null,
      veterinariosDisponibles: [],
      loadingVeterinarios: false
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
        const fichaClinicaId = this.$route.query.fichaClinicaId;
        const response = await backend.post('/facturas/createOrGet', { fichaClinicaId: fichaClinicaId });
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
    async openVeterinarioModal() {
      await this.fetchVeterinariosDisponibles();
      this.showVeterinarioModal = true;
    },

    async fetchVeterinariosDisponibles() {
      this.loadingVeterinarios = true;
      try {
        const response = await backend.get('/veterinarios');
        this.veterinariosDisponibles = response.data.map(vet => ({
          id: vet.id,
          nombre: `${vet.user.nombre} ${vet.user.apellido}`
        }));
      } catch (error) {
        console.error('Error al obtener veterinarios:', error);
      } finally {
        this.loadingVeterinarios = false;
      }
    },
    async asignarVeterinario() {
      if (!this.selectedVeterinario) return;
      
      try {
        await backend.post('/asignacion', {
          fichaClinicaId: this.fichaClinicaId,
          veterinarioId: this.selectedVeterinario
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        await this.fetchVeterinariosAsignados();
        this.showVeterinarioModal = false;
        this.selectedVeterinario = null;
        
      } catch (error) {
        console.error('Error al asignar veterinario:', error);
      }
    },
    async fetchVeterinariosAsignados() {
      try {
        const response = await backend.get(`/asignacion/${this.fichaClinicaId}`);
        this.veterinariosAsignados = response.data.veterinarios;
      } catch (error) {
        console.error("Error al obtener veterinarios:", error);
      }
    },
    async irAFacturacion() {
      if (this.facturaExistente) {
        console.log("HOLAAAAAAAAA 2");
        console.log(this.animal);
        // Redirige a la factura existente
        this.$router.push({
          name: 'IndexFacturaPage',
          params: { fichaClinicaId: this.fichaClinicaId, facturaId: this.facturaId },
          props: {
            animal: this.animal,
            // Nota: falta el responsable, necesitarías agregarlo al estado y obtenerlo 
          }
        });
      } else {
        // Crea una nueva factura si no existe
        try {
          const response = await backend.post('/facturas/createOrGet', { fichaClinicaId: this.fichaClinicaId });
          this.facturaId = response.data.id;
          console.log("HOLAAAAAAAAA");
          console.log(this.animal);
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
      await this.verificarFactura();
      await this.fetchVeterinariosAsignados();
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
.ficha-title {
  color: #0F3460;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.info-title {
  color: #0F3460;
  font-size: 18px;
  font-weight: 500;
  padding: 12px 16px;
}

.field-group {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.field-value {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  background-color: white;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.v-btn {
  text-transform: none;
}

.v-btn.primary {
  background-color: #014582;
  color: white;
}

.v-btn.primary:hover {
  background-color: #013262;
}
</style>
