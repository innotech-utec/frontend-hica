<template>
  <v-row>
    <v-col cols="12" class="animal-info">
      <v-card :class="{ 'disabled-module': isDisabled }">
        <v-card-title class="section-title">Detalle de toma de Parámetros</v-card-title>
        <v-card-text class="justified-text">
          <v-data-table
            v-if="parametros.length > 0"
            :items="parametros"
            :headers="headers"
            item-key="id"
            class="mb-5"
          >
            <template v-slot:[`item.fecha`]="{ item }">
              {{ formatFecha(item.fecha) }}
            </template>
            <template v-slot:[`item.hora`]="{ item }">
              {{ formatHora(item.hora) }}
            </template>
            <template v-slot:[`item.FC`]="{ item }">
              {{ item.FC }} lpm
            </template>
            <template v-slot:[`item.FR`]="{ item }">
              {{ item.FR }} rpm
            </template>
            <template v-slot:[`item.temperatura`]="{ item }">
              {{ item.temperatura }}°C
            </template>
            <template v-slot:[`item.acciones`]="{ item }">
              <v-btn
                icon
                @click="openEditModal(item)"
                :disabled="isDisabled"
                outlined
                title="Editar parámetros"
              >
                <v-icon color="#014582">mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-data-table>
          <p v-else>No hay registros de parámetros disponibles.</p>

          <v-card-actions class="justify-center">
  <v-btn
    color="#0046B5" 
    :disabled="isDisabled"
    @click="openCreateModal"
    outlined
    class="text-none"
  >
    <v-icon left>mdi-pencil</v-icon> Registrar Parámetros
  </v-btn>
</v-card-actions>
        </v-card-text>

        <CreateParametrosPage
          v-if="showCreateModal"
          :ficha-clinica-id="fichaClinicaId"
          @closeModal="closeCreateModal"
          @parametroRegistrado="fetchParametros"
        />

        <EditParametrosPage
          v-if="showEditModal"
          :parametro="parametroSeleccionado"
          :show="showEditModal"
          @parametroActualizado="fetchParametros"
          @cerrarModal="closeEditModal"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateParametrosPage from "@/animales/components/pages/CreateParametrosPage.vue";
import EditParametrosPage from "@/animales/components/pages/EditParametrosPage.vue";

export default {
  props: ["fichaClinicaId", "disabled", "estadoFicha"],
  components: {
    CreateParametrosPage,
    EditParametrosPage,
  },
  data() {
    return {
      parametros: [],
      showCreateModal: false,
      showEditModal: false,
      parametroSeleccionado: null,
      headers: [
        { 
          title: "Fecha",
          align: "start",
          sortable: true,
          key: "fecha",
        },
        { 
          title: "Hora",
          align: "start",
          sortable: true,
          key: "hora",
        },
        { 
          title: "FC",
          align: "start",
          sortable: true,
          key: "FC",
        },
        { 
          title: "FR",
          align: "start",
          sortable: true,
          key: "FR",
        },
        { 
          title: "°C",
          align: "start",
          sortable: true,
          key: "temperatura",
        },
        { 
          title: "Mucosas",
          align: "start",
          sortable: true,
          key: "mucosas",
        },
        { 
          title: "TllC",
          align: "start",
          sortable: true,
          key: "TllC",
        },
        { 
          title: "Pliegue Cutáneo",
          align: "start",
          sortable: true,
          key: "pliegueCutaneo",
        },
        { 
          title: "Observaciones",
          align: "start",
          sortable: true,
          key: "observaciones",
        },
        { 
          title: "Acciones",
          align: "center",
          sortable: false,
          key: "acciones",
        },
      ],
    };
  },
  computed: {
    isDisabled() {
      const estadosCerrados = ["Alta", "Fallecimiento", "Eutanasia"];
      return this.disabled || estadosCerrados.includes(this.estadoFicha);
    },
  },
  methods: {
    async fetchParametros() {
      if (!this.fichaClinicaId) return;

      try {
        const response = await backend.get(
          `/registroParametros/fichaClinica/${this.fichaClinicaId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        this.parametros = response.data;
      } catch (error) {
        console.error("Error al obtener los parámetros:", error);
        if (error.response && error.response.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo obtener los parámetros registrados.",
          });
        }
      }
    },
    formatFecha(fecha) {
      return new Date(fecha).toLocaleDateString("es-ES", { timeZone: "UTC" });
    },
    formatHora(hora) {
  if (!hora) return ""; 

    if (hora.length === 5 && hora.includes(":")) {
    return hora;
  }
  return hora.substring(0, 5);
},
    openCreateModal() {
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
    openEditModal(parametro) {
      this.parametroSeleccionado = { ...parametro };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
  },
  watch: {
    fichaClinicaId(newId) {
      if (newId) {
        this.fetchParametros();
      }
    },
  },
  created() {
    if (this.fichaClinicaId) {
      this.fetchParametros();
    }
  },
};
</script>

<style scoped>
.section-title {
  font-size: 20px;
  color: #014582;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}
.v-btn {
  transition: transform 0.2s ease;
  
}
.v-btn:hover {
  transform: translateY(-2px);
}

.disabled-module {
  opacity: 0.5;
  pointer-events: none;
}

</style>