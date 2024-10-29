<template>
  <v-card>
    <v-card-title class="section-title">Historia Clínica</v-card-title>
    <v-card-subtitle v-if="animal">
      <span>Animal: {{ animal.nombre }} - {{ animal.especie }} - {{ animal.raza }}</span>
      <br>
      <span>Responsable: {{ responsable.nombre || 'Sin responsable' }} {{ responsable.apellido || '' }}</span>
    </v-card-subtitle>
    <v-card-text>
      <!-- Filtros -->
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
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="filtroFecha"
        label="Filtrar por Fecha de Ingreso"
        prepend-inner-icon="mdi-calendar"
        
        v-bind="attrs"
        v-on="on"
        outlined
        dense
        clearable
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="filtroFecha"
      @input="(val) => { filtroFecha = val; menuFecha = false; filtrarFichasClinicas(); }"
    ></v-date-picker>
  </v-menu>
</v-col>

      </v-row>

      <!-- Fichas Clínicas -->
      <v-row v-if="fichasFiltradas.length">
        <v-col v-for="ficha in fichasFiltradas" :key="ficha.id" cols="12">
          <v-card class="ficha-card">
            <v-card-title>
              <span class="ficha-fecha">Fecha de Ingreso: {{ formatFecha(ficha.createdAt) }}</span>
              <v-chip :color="getEstadoColor(ficha.estadoFichaClinica)" class="ml-3">{{ ficha.estadoFichaClinica }}</v-chip>
            </v-card-title>
            <v-card-text>
              <p><strong>Motivo de Consulta:</strong> {{ ficha.motivoConsulta || 'Sin datos' }}</p>
              <p><strong>Diagnóstico:</strong> {{ ficha.examenObjetivo?.diagnostico || 'Sin diagnóstico' }}</p>
              <p><strong>Fecha Última Modificación:</strong> {{ formatFecha(ficha.updatedAt) || 'Sin datos' }}</p>
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

    <!-- Botón de regresar -->
    <v-btn icon @click="goBack">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </v-card>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import backend from "@/backend";
import Swal from "sweetalert2";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  props: ['animalId'],
  setup(props) {
    const router = useRouter();
    const fichasClinicas = ref([]);
    const filtroDiagnostico = ref('');
    const filtroFecha = ref('');
    const menuFecha = ref(false);
    const animal = ref(null);
    const responsable = ref({});

    const fichasFiltradas = computed(() => {
      return fichasClinicas.value.filter(ficha => {
        const matchDiagnostico = filtroDiagnostico.value
          ? ficha.examenObjetivo?.diagnostico.toLowerCase().includes(filtroDiagnostico.value.toLowerCase())
          : true;
        const matchFecha = filtroFecha.value
          ? formatFecha(ficha.createdAt) === filtroFecha.value
          : true;
        return matchDiagnostico && matchFecha;
      });
    });

    const fetchAnimalDetails = async () => {
      try {
        const response = await backend.get(`/animales/${props.animalId}`);
        animal.value = response.data;
        if (animal.value && animal.value.responsableId) {
          await fetchResponsable(animal.value.responsableId);
        } else {
          Swal.fire({
            icon: "info",
            title: "Sin responsable",
            text: "El animal no tiene responsable asignado.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los detalles del animal.",
        });
      }
    };

    const fetchResponsable = async (responsableId) => {
      try {
        const response = await backend.get(`/responsables/${responsableId}`);
        responsable.value = response.data;
      } catch (error) {
        console.error('Error al cargar el responsable:', error.response || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo cargar el responsable.",
        });
      }
    };

    const fetchFichasClinicas = async () => {
      try {
        const response = await backend.get(`/fichasClinicas/animal/${props.animalId}`);
        fichasClinicas.value = response.data;
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo obtener las fichas clínicas." });
      }
    };

    const fetchExamenObjetivo = async (fichaClinicaId) => {
      try {
        const response = await backend.get(`/examenObjetivo/fichaClinica/${fichaClinicaId}`);
        return response.data;
      } catch (error) {
        console.error("Error al obtener el Examen Objetivo:", error);
        return null;
      }
    };

    const fetchTratamientos = async (fichaClinicaId) => {
      try {
        const response = await backend.get(`/tratamientos/${fichaClinicaId}`);
        return response.data;
      } catch (error) {
        console.error("Error al obtener tratamientos:", error);
        return [];
      }
    };

    const fetchRegistroParametros = async (fichaClinicaId) => {
      try {
        const response = await backend.get(`/registroParametros/fichaClinica/${fichaClinicaId}`);
        return response.data;
      } catch (error) {
        console.error("Error al obtener registro de parámetros:", error);
        return [];
      }
    };

    const downloadFichaPDF = async (ficha) => {
      const doc = new jsPDF();
      const primaryColor = "#6FA1D2";

      const getBase64Image = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  try {
   
    const hicaLogo = await getBase64Image('/HICA_logo.png');
    const fvetLogo = await getBase64Image('/FVET_logo.png');

  
    const logoWidth = 20; 
    const logoHeight = 20;

   
    if (hicaLogo) doc.addImage(hicaLogo, 'PNG', 10, 5, logoWidth, logoHeight);
    if (fvetLogo) doc.addImage(fvetLogo, 'PNG', 170, 5, logoWidth, logoHeight);

      // Título principal
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text("Ficha Clínica", 105, 40, null, null, 'center');

      const tableStyles = {
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: primaryColor },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        }
      };

      // Información del Responsable y Animal
      doc.autoTable({
        ...tableStyles,
        startY: 50,
        head: [['Documento', 'Nombre', 'Apellido', 'Nombre del Paciente', 'Especie', 'Raza', 'Sexo']],
        body: [[
          responsable.value.documento || 'Sin datos',
          responsable.value.nombre || 'Sin datos',
          responsable.value.apellido || 'Sin datos',
          animal.value.nombre || 'Sin datos',
          animal.value.especie || 'Sin datos',
          animal.value.raza || 'Sin datos',
          animal.value.sexo || 'Sin datos'
        ]]
      });

      // Detalles de la Ficha Clínica
      doc.autoTable({
        ...tableStyles,
        startY: doc.lastAutoTable.finalY + 5,
        head: [['Fecha de Ingreso', 'Motivo de Consulta', 'Estado', 'Fecha Última Modificación']],
        body: [[
          formatFecha(ficha.createdAt) || 'Sin datos',
          ficha.motivoConsulta || 'Sin datos',
          ficha.estadoFichaClinica || 'Sin datos',
          formatFecha(ficha.updatedAt) || 'Sin datos'
        ]]
      });

      // Examen Objetivo
      const examenObjetivo = await fetchExamenObjetivo(ficha.id);
      doc.autoTable({
        ...tableStyles,
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Diagnóstico', 'FC', 'Respiración', 'Temperatura']],
        body: examenObjetivo
          ? [[
              examenObjetivo.diagnostico || 'Sin diagnóstico',
              examenObjetivo.FC || 'N/A',
              examenObjetivo.Resp || 'N/A',
              examenObjetivo.temperatura || 'N/A'
            ]]
          : [['No hay datos de Examen Objetivo', '', '', '']]
      });

      // Tratamientos
      const tratamientos = await fetchTratamientos(ficha.id);
      doc.autoTable({
        ...tableStyles,
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Fecha Tratamiento', 'Medicación', 'Observaciones']],
        body: tratamientos.length > 0
          ? tratamientos.map(tratamiento => [
              formatFecha(tratamiento.fechaTratamiento) || 'Sin fecha',
              tratamiento.medicacion || 'Sin medicación',
              tratamiento.observaciones || 'Sin observaciones'
            ])
          : [['No hay tratamientos registrados', '', '']]
      });

      // Parámetros
      const parametros = await fetchRegistroParametros(ficha.id);
      doc.autoTable({
        ...tableStyles,
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Fecha', 'FC', 'FR', 'Temperatura']],
        body: parametros.length > 0
          ? parametros.map(parametro => [
              formatFecha(parametro.fechaParametro) || 'Sin fecha',
              parametro.FC || 'N/A',
              parametro.FR || 'N/A',
              parametro.temperatura || 'N/A'
            ])
          : [['No hay parámetros registrados', '', '', '']]
      });

      doc.save(`ficha_clinica_${ficha.id}.pdf`);
  } catch (error) {
    console.error("Error al cargar las imágenes:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un problema al cargar las imágenes en el PDF.",
    });
  }
};

    const formatFecha = (fecha) => {
      if (!fecha) return 'Sin fecha';
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
      router.push({
        name: 'fichaClinica.view',
        query: { fichaClinicaId: ficha.id, animalId: animal.value.id }
      });
    };

    const goBack = () => {
      window.history.back();
    };

    onMounted(() => {
      fetchAnimalDetails();
      fetchFichasClinicas();
    });

    return {
      fichasFiltradas,
      filtroDiagnostico,
      filtroFecha,
      menuFecha,
      animal,
      responsable,
      formatFecha,
      getEstadoColor,
      viewFicha,
      downloadFichaPDF,
      goBack
    };
  }
};
</script>


<style scoped>
.section-title {
  color: #014582;
  font-weight: bold;
}

.v-card-text {
  background-color: #fff !important;
}

.filter-row,
.ficha-card {
  background-color: #fff;
}

.v-btn.primary {
  color: #014582;
}

.v-btn.secondary {
  color: #008575;
}
</style>
