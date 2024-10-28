<!-- src/animales/components/pages/ViewHistoriaClinicaPage.vue -->
<template>
    <v-card>
      <v-card-title class="section-title">Historia Clínica</v-card-title>
      <v-card-text>
        <v-row class="filter-row" justify="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filtroDiagnostico"
              label="Buscar por Diagnóstico"
              prepend-inner-icon="mdi-magnify"
              outlined dense clearable
              @input="filtrarFichasClinicas"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-menu
              ref="menu"
              v-model="menuFecha"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="filtroFecha"
                  label="Filtrar por Fecha de Ingreso"
                  prepend-inner-icon="mdi-calendar"
                  readonly v-bind="attrs"
                  v-on="on"
                  outlined dense clearable
                ></v-text-field>
              </template>
              <v-date-picker v-model="filtroFecha" @input="filtrarFichasClinicas"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
  
        <v-row v-if="fichasFiltradas.length">
          <v-col v-for="ficha in fichasFiltradas" :key="ficha.id" cols="12">
            <v-card class="ficha-card">
              <v-card-title>
                <span class="ficha-fecha">Fecha de Ingreso: {{ formatFecha(ficha.createdAt) }}</span>
                <v-chip :color="getEstadoColor(ficha.estadoFichaClinica)" class="ml-3">{{ ficha.estadoFichaClinica }}</v-chip>
              </v-card-title>
              <v-card-text>
                <p><strong>Motivo de Consulta:</strong> {{ ficha.motivoConsulta }}</p>
                <p><strong>Diagnóstico:</strong> {{ ficha.examenObjetivo?.diagnostico || 'Sin diagnóstico' }}</p>
                <p><strong>Fecha Última Modificación:</strong> {{ formatFecha(ficha.updatedAt) }}</p>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" outlined @click="viewFicha(ficha)">Visualizar</v-btn>
                <v-btn color="secondary" outlined @click="downloadFichaPDF(ficha)">Imprimir</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
  
        <p v-else>No hay fichas clínicas registradas.</p>
      </v-card-text>
  
      <!-- Modal para ver la ficha detallada -->
      <view-ficha-modal v-if="showFichaModal" :ficha="fichaSeleccionada" @close="showFichaModal = false"></view-ficha-modal>
    </v-card>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import backend from "@/backend";
  import Swal from "sweetalert2";
  import ViewFichaModal from './ViewFichaModal.vue';
  import jsPDF from 'jspdf';
  
  export default {
    components: { ViewFichaModal },
    props: ['animalId'],
    setup(props) {
      const fichasClinicas = ref([]);
      const filtroDiagnostico = ref('');
      const filtroFecha = ref('');
      const menuFecha = ref(false);
      const showFichaModal = ref(false);
      const fichaSeleccionada = ref(null);
  
      const fichasFiltradas = computed(() => {
        return fichasClinicas.value.filter(ficha => {
          const matchDiagnostico = ficha.examenObjetivo?.diagnostico.toLowerCase().includes(filtroDiagnostico.value.toLowerCase());
          const matchFecha = filtroFecha.value ? formatFecha(ficha.createdAt) === filtroFecha.value : true;
          return matchDiagnostico && matchFecha;
        });
      });
  
      const fetchFichasClinicas = async () => {
        if (!props.animalId) return;
        try {
          const response = await backend.get(`/historiaClinica/${props.animalId}`);
          fichasClinicas.value = response.data;
        } catch (error) {
          Swal.fire({ icon: "error", title: "Error", text: "No se pudo obtener la historia clínica." });
        }
      };
  
      const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' });
      };
  
      const getEstadoColor = (estado) => {
        switch (estado.toLowerCase()) {
          case 'alta': return 'green';
          case 'fallecimiento':
          case 'eutanasia': return 'red';
          case 'internado': return 'blue';
          default: return 'orange';
        }
      };
  
      const viewFicha = (ficha) => {
        fichaSeleccionada.value = ficha;
        showFichaModal.value = true;
      };
  
      const downloadFichaPDF = (ficha) => {
        const doc = new jsPDF();
        doc.text("Ficha Clínica", 10, 10);
        doc.text(`Fecha de Ingreso: ${formatFecha(ficha.createdAt)}`, 10, 20);
        doc.text(`Motivo de Consulta: ${ficha.motivoConsulta}`, 10, 30);
        doc.text(`Diagnóstico: ${ficha.examenObjetivo?.diagnostico || 'Sin diagnóstico'}`, 10, 40);
        doc.text(`Estado: ${ficha.estadoFichaClinica}`, 10, 50);
        doc.text(`Fecha Última Modificación: ${formatFecha(ficha.updatedAt)}`, 10, 60);
        doc.save(`ficha_clinica_${ficha.id}.pdf`);
      };
  
      onMounted(() => { if (props.animalId) fetchFichasClinicas(); });
  
      return {
        fichasFiltradas, filtroDiagnostico, filtroFecha, menuFecha, showFichaModal, fichaSeleccionada,
        formatFecha, getEstadoColor, viewFicha, downloadFichaPDF
      };
    },
  };
  </script>
  