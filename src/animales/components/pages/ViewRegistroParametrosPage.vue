<!-- ViewRegistroParametrosPage.vue -->
<template>
  <v-row>
    <v-col cols="12" class="animal-info">
      <v-card :class="{ 'disabled-module': disabled }">
        <v-card-title class="section-title">Detalle de toma de Parámetros</v-card-title>
        <v-card-text class="justified-text">
          <!-- Mostrar tabla de parámetros si ya están registrados -->
          <v-data-table v-if="parametros.length > 0" :items="parametros" :headers="headers" class="mb-5">
            <template #item="{ item }">
              <tr>
                <td>{{ new Date(item.fecha).toLocaleDateString() }}</td>
                <td>{{ item.hora }}</td>
                <td>{{ item.FC }}</td>
                <td>{{ item.FR }}</td>
                <td>{{ item.temperatura }}</td>
                <td>{{ item.mucosas }}</td>
                <td>{{ item.TllC }}</td>
                <td>{{ item.pliegueCutaneo }}</td>
                <td>{{ item.observaciones }}</td>
              </tr>
            </template>
          </v-data-table>
          <p v-else>No hay registros de parámetros disponibles.</p>
          <v-card-actions>
            <v-btn color="primary" :disabled="disabled" @click="openCreateModal" outlined>
              <v-icon left>mdi-pencil</v-icon> Registrar Parámetros
            </v-btn>
          </v-card-actions>
        </v-card-text>
        
        <!-- Modal para registrar nuevos parámetros -->
        <CreateParametrosPage
          v-if="showCreateModal"
          :ficha-clinica-id="fichaClinicaId"
          @closeModal="showCreateModal = false"
          @parametroRegistrado="fetchParametros"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateParametrosPage from '@/animales/components/pages/CreateParametrosPage.vue';

export default {
  props: ['fichaClinicaId', 'disabled'],
  components: {
    CreateParametrosPage,
  },
  data() {
    return {
      parametros: [],
      showCreateModal: false,
      headers: [
        { text: 'Fecha', value: 'fecha' },
        { text: 'Hora', value: 'hora' },
        { text: 'Frecuencia Cardíaca (FC)', value: 'FC' },
        { text: 'Frecuencia Respiratoria (FR)', value: 'FR' },
        { text: 'Temperatura (°C)', value: 'temperatura' },
        { text: 'Mucosas', value: 'mucosas' },
        { text: 'TllC', value: 'TllC' },
        { text: 'Pliegue Cutáneo', value: 'pliegueCutaneo' },
        { text: 'Observaciones', value: 'observaciones' },
      ],
    };
  },
  methods: {
    async fetchParametros() {
      if (!this.fichaClinicaId) {
        console.warn("fichaClinicaId is missing");
        return;
      }

      try {
        const response = await backend.get(`/registroParametros/fichaClinica/${this.fichaClinicaId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.parametros = response.data;
      } catch (error) {
        console.error("Error al obtener los parámetros:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los parámetros registrados.",
        });
      }
    },
    openCreateModal() {
      this.showCreateModal = true;
    },
  },
  created() {
    this.fetchParametros();
  },
};
</script>
