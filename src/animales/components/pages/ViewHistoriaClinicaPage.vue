<template>
  <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Historia Clínica</h2>
      </v-col>
    </v-row>
  <v-card>
    <v-card-text>

         <!-- Información del animal -->
    <v-card flat class="mb-4" v-if="animal && animal.nombre">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Nombre:</label>
              <div class="field-value">{{ animal.nombre || '-' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Especie:</label>
              <div class="field-value">{{ animal.especie || '-' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Raza:</label>
              <div class="field-value">{{ animal.raza || '-' }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
        <!-- <v-col cols="12" md="4">
          <v-menu ref="menu" v-model="menuFecha" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="filtroFecha"
                label="Filtrar por Fecha de Ingreso"
                prepend-inner-icon="mdi-calendar"
                v-bind="attrs"
                v-on="on"
                outlined dense clearable
              ></v-text-field>
            </template>
            <v-date-picker v-model="filtroFecha" @input="(val) => { filtroFecha = val; menuFecha = false; filtrarFichasClinicas(); }"></v-date-picker>
          </v-menu>
        </v-col> -->
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
        // Obtener las fichas clínicas básicas
        const response = await backend.get(`/fichasClinicas/animal/${props.animalId}`);
        
        // Para cada ficha, obtener la información adicional
        const fichasCompletas = await Promise.all(
          response.data.map(async (ficha) => {
            // Obtener toda la información adicional en paralelo
            const [examenObjetivo, tratamientos, registroParametros] = await Promise.all([
              fetchExamenObjetivo(ficha.id),
              fetchTratamientos(ficha.id),
              fetchRegistroParametros(ficha.id)
            ]);

            // Retornar la ficha con toda la información anexada
            return {
              ...ficha,
              examenObjetivo,
              tratamientos,
              registroParametros
            };
          })
        );

        fichasClinicas.value = fichasCompletas;
      } catch (error) {
        Swal.fire({ 
          icon: "error", 
          title: "Error", 
          text: "No se pudo obtener las fichas clínicas." 
        });
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

    const downloadFichaPDF = async (ficha) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = 20;

      try {
        const hicaLogo = await getBase64Image('/HICA_logo.png');
        const fvetLogo = await getBase64Image('/FVET_logo.png');
        if (hicaLogo) doc.addImage(hicaLogo, 'PNG', 10, 5, 20, 20);
        if (fvetLogo) doc.addImage(fvetLogo, 'PNG', 170, 5, 20, 20);

        yPosition += 30;
        doc.setFontSize(20);
        doc.setTextColor(50, 100, 200);
        doc.text('HISTORIA CLÍNICA', pageWidth / 2, yPosition, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        yPosition += 15;
        doc.setFontSize(12);
        doc.text('Facultad de Veterinaria', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        doc.text('Universidad de la República Uruguay', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        doc.text('Ruta 8 Km. 18, Montevideo', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;
        doc.setDrawColor(50, 100, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        yPosition += 15;
        doc.setFontSize(11);
        doc.text(`Ficha Nº: ${ficha.id || 'N/A'}`, margin, yPosition);
        doc.text(`Fecha: ${formatFecha(ficha.createdAt)}`, pageWidth - margin - 50, yPosition);

        yPosition += 15;
        const responsableInfo = [
          ['Documento', 'Nombre', 'Apellido', 'Nombre del Paciente', 'Especie', 'Raza', 'Sexo']
        ];
        const responsableData = [[
          responsable.value.documento || 'Sin datos',
          responsable.value.nombre || 'Sin datos',
          responsable.value.apellido || 'Sin datos',
          animal.value.nombre || 'Sin datos',
          animal.value.especie || 'Sin datos',
          animal.value.raza || 'Sin datos',
          animal.value.sexo || 'Sin datos'
        ]];

        doc.autoTable({
          startY: yPosition,
          head: responsableInfo,
          body: responsableData,
          margin: { left: margin },
        });

        yPosition = doc.lastAutoTable.finalY + 10;
        const fichaInfo = [['Fecha de Ingreso', 'Motivo de Consulta', 'Estado', 'Fecha Última Modificación']];
        const fichaData = [[
          formatFecha(ficha.createdAt) || 'Sin datos',
          ficha.motivoConsulta || 'Sin datos',
          ficha.estadoFichaClinica || 'Sin datos',
          formatFecha(ficha.updatedAt) || 'Sin datos'
        ]];

        doc.autoTable({
          startY: yPosition,
          head: fichaInfo,
          body: fichaData,
          margin: { left: margin },
     
        });

        yPosition = doc.lastAutoTable.finalY + 10;
        const examenObjetivo = await fetchExamenObjetivo(ficha.id);
        doc.autoTable({
          startY: yPosition,
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

        yPosition = doc.lastAutoTable.finalY + 10;
        const tratamientos = await fetchTratamientos(ficha.id);
        doc.autoTable({
          startY: yPosition,
          head: [['Fecha Tratamiento', 'Medicación', 'Observaciones']],
          body: tratamientos.length > 0
            ? tratamientos.map(tratamiento => [
                formatFecha(tratamiento.fecha) || 'Sin fecha',
                tratamiento.medicacion || 'Sin medicación',
                tratamiento.observaciones || 'Sin observaciones'
              ])
            : [['No hay tratamientos registrados', '', '']]
        });

        yPosition = doc.lastAutoTable.finalY + 10;
        const parametros = await fetchRegistroParametros(ficha.id);
        doc.autoTable({
          startY: yPosition,
          head: [['Fecha Parámetro', 'FC', 'FR', 'Temperatura']],
          body: parametros.length > 0
            ? parametros.map(parametro => [
                formatFecha(parametro.fecha) || 'Sin fecha',
                parametro.FC || 'N/A',
                parametro.FR || 'N/A',
                parametro.temperatura || 'N/A'
              ])
            : [['No hay parámetros registrados', '', '', '']]
        });

        doc.save(`historia_clinica_${ficha.id}.pdf`);
      } catch (error) {
        console.error("Error al generar el PDF:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al generar el PDF.",
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
.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
}
.v-table {
  width: 100%;
  background-color: #fafafa;
  border-radius: 4px;
}
.v-table th {
  background-color: #e8eaf6;
  color: #014582;
  font-weight: bold;
  text-align: left;
  padding: 8px; 
}
.v-table td {
  padding: 12px;
}
.text-right {
  text-align: right;
}
.font-weight-bold {
  font-weight: bold;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
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
</style>
