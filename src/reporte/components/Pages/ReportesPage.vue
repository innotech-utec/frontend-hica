<template>
  <BackButton />
  <v-container fluid class="bg-grey-lighten-5">
      <v-row class="justify-center">
          <v-col cols="12" class="text-center">
              <h2 class="page-title">Reportes</h2>
          </v-col>
      </v-row>

      <!-- Filtros Card -->
      <v-card class="mb-6 rounded-lg filters-card">
          <v-card-text>
              <v-row>
                  <v-col cols="12" md="6">
                      <v-select
                          v-model="selectedReportType"
                          :items="reportTypes"
                          label="Tipo de Reporte"
                          item-title="label"
                          item-value="endpoint"
                          variant="outlined"
                          density="comfortable"
                          class="rounded-lg"
                          bg-color="grey-lighten-4"
                          clearable
                      ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                      <v-select
                          v-model="selectedDateRange"
                          :items="dateRanges"
                          label="Rango de Fechas"
                          item-title="text"
                          item-value="value"
                          variant="outlined"
                          density="comfortable"
                          class="rounded-lg"
                          bg-color="grey-lighten-4"
                          @update:model-value="handleDateRangeChange"
                      ></v-select>
                  </v-col>
              </v-row>
              <v-row>
                  <v-col cols="12" md="6">
                      <v-text-field
                          v-model="filters.start"
                          label="Fecha Inicio"
                          type="date"
                          variant="outlined"
                          density="comfortable"
                          class="rounded-lg"
                          bg-color="grey-lighten-4"
                          :max="filters.end"
                      ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                      <v-text-field
                          v-model="filters.end"
                          label="Fecha Fin"
                          type="date"
                          variant="outlined"
                          density="comfortable"
                          class="rounded-lg"
                          bg-color="grey-lighten-4"
                          :min="filters.start"
                      ></v-text-field>
                  </v-col>
              </v-row>
              <v-row class="justify-center mt-2">
                  <v-col cols="12" class="text-center">
                      <v-btn
                          color="primary"
                          @click="generateReport"
                          :loading="loading"
                          :disabled="!isFormValid"
                          class="mx-2 px-6 text-capitalize rounded-lg action-button"
                          elevation="1"
                      >
                          <v-icon start>mdi-chart-box</v-icon>
                          Generar Reporte
                      </v-btn>
                      <v-btn
                          color="secondary"
                          @click="downloadCSV"
                          :disabled="!reportData.length"
                          class="mx-2 px-6 text-capitalize rounded-lg action-button"
                          elevation="1"
                      >
                          <v-icon start>mdi-download</v-icon>
                          Descargar CSV
                      </v-btn>
                  </v-col>
              </v-row>
          </v-card-text>
      </v-card>

      <!-- Resultados Card -->
      <v-card v-if="reportData.length" class="rounded-lg results-card">
          <v-card-item>
              <v-card-title class="text-h5 font-weight-medium primary-text">
                  Resultados del Reporte
              </v-card-title>
              <v-card-subtitle>
                  {{ getTitleForReportType() }} - Fechas: {{ formatDate(filters.start) }} a
                  {{ formatDate(filters.end) }}
              </v-card-subtitle>
          </v-card-item>
          <v-card-text>
              <v-row class="mb-6">
                  <v-col cols="12" md="6">
                      <v-card class="rounded-lg kpi-card primary-bg">
                          <v-card-text>
                              <div class="text-subtitle-1">Total Registros</div>
                              <div class="text-h4">{{ reportData.length }}</div>
                          </v-card-text>
                      </v-card>
                  </v-col>
                  <v-col v-if="!isAnimalReport" cols="12" md="6">
                      <v-card class="rounded-lg kpi-card accent-bg">
                          <v-card-text>
                              <div class="text-subtitle-1">Total Tratamientos</div>
                              <div class="text-h4">
                                  {{
                                      reportData.reduce(
                                          (sum, item) => sum + (item.cantidad || item.cantidadTratamientos || 0),
                                          0
                                      )
                                  }}
                              </div>
                          </v-card-text>
                      </v-card>
                  </v-col>
              </v-row>
              <v-row class="mb-4">
                  <v-col cols="12" class="d-flex justify-end">
                      <v-btn-group>
                          <v-btn
                              :color="chartType === 'bar' ? 'primary' : 'grey'"
                              @click="chartType = 'bar'; updateChartData();"
                              class="text-capitalize"
                          >
                              <v-icon start>mdi-chart-bar</v-icon>
                              Barras
                          </v-btn>
                         
                              
                         </v-btn-group>
                  </v-col>
              </v-row>
              <v-row>
                  <v-col cols="12">
                      <apex-chart
                          v-if="chartSeries.length && chartSeries[0].data.length"
                          :key="chartType"
                          :type="chartType"
                          height="350"
                          :options="chartOptions"
                          :series="chartSeries"
                          class="rounded-lg chart-container"
                      ></apex-chart>
                  </v-col>
              </v-row>
              <v-table class="mt-6 rounded-lg data-table" hover>
                  <thead>
                      <tr>
                          <th class="text-left font-weight-medium">Fecha</th>
                          <th v-if="isAnimalReport" class="text-left font-weight-medium">Edad</th>
                          <th v-if="isAnimalReport" class="text-left font-weight-medium">Especie</th>
                          <th v-if="isAnimalReport" class="text-left font-weight-medium">Raza</th>
                          <th v-if="isAnimalReport" class="text-left font-weight-medium">Motivo de Consulta</th>
                          <th v-if="isAnimalReport" class="text-left font-weight-medium">Diagnóstico</th>
                          <th v-if="!isAnimalReport" class="text-left font-weight-medium">Veterinario</th>
                          <th v-if="!isAnimalReport" class="text-left font-weight-medium">Cantidad</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr
                          v-for="(item, index) in reportData"
                          :key="index"
                          :class="{ 'grey lighten-4': index % 2 === 0 }"
                      >
                      <td>{{ formatDate(selectedReportType === '/veterinarios-tratamientos' ? item.fechaTratamiento : item.fechaModificacion) }}</td>
              <td v-if="isAnimalReport">{{ item.edad }}</td>
              <td v-if="isAnimalReport">{{ item.especie }}</td>
              <td v-if="isAnimalReport">{{ item.raza }}</td>
              <td v-if="isAnimalReport">{{ item.motivoConsulta }}</td>
              <td v-if="isAnimalReport">{{ item.diagnostico }}</td>
              <td v-if="!isAnimalReport">{{ item.nombreVeterinario }} {{ item.apellidoVeterinario }}</td>
              <td v-if="!isAnimalReport">{{ item.cantidadTratamientos }}</td>
                      </tr>
                  </tbody>
              </v-table>
          </v-card-text>
      </v-card>
  </v-container>
</template>
  
  <script setup>

import { ref, reactive, computed, watch } from "vue";
import VueApexCharts from 'vue3-apexcharts';
import backend from "@/backend";
import { useToast } from "vue-toast-notification";
import BackButton from '@/shared/components/BackButton.vue';
import "vue-toast-notification/dist/theme-default.css";


const $toast = useToast();
const selectedReportType = ref(null);
const selectedDateRange = ref("last-month");
const groupBy = ref("monthly");
const loading = ref(false);
const reportData = ref([]);
const chartSeries = ref([]);
const chartType = ref("bar");

const reportTypes = [
  { label: "Animales Fallecidos", endpoint: "/animales-fallecidos" },
  { label: "Animales Eutanasia", endpoint: "/animales-eutanasia" },
  { label: "Tratamientos por Veterinario", endpoint: "/veterinarios-tratamientos" },
];

const dateRanges = [
  { text: "Último mes", value: "last-month" },
  { text: "Últimos 3 meses", value: "last-3-months" },
  { text: "Último año", value: "last-year" },
  { text: "Personalizado", value: "custom" },
];


const ApexChart = VueApexCharts;
const filters = reactive({
  start: new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split("T")[0],
  end: new Date().toISOString().split("T")[0],
});

const isAnimalReport = computed(() => {
  return (
    selectedReportType.value === "/animales-fallecidos" ||
    selectedReportType.value === "/animales-eutanasia"
  );
});

const isFormValid = computed(() => {
  return selectedReportType.value && filters.start && filters.end;
});



const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false
    }
  },
  xaxis: {
    categories: [],
    labels: {
      rotate: -45,
      rotateAlways: true,
      trim: true,
      style: {
        fontSize: '10px'
      }
    }
  },
  yaxis: {
    title: {
      text: 'Cantidad'
    }
  },
  title: {
    text: "Datos del Reporte",
    align: "center",
  },
  dataLabels: {
    enabled: false
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      distributed: true
    }
  },
  colors: ["#014582"], 
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: '100%'
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
});

const updateChartData = () => {
  if (chartSeries.value.length && chartSeries.value[0].data.length) {
    
    chartOptions.value = {
      ...chartOptions.value,
      chart: {
        type: chartType.value,
        height: 350,
     
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      xaxis: {
        categories: chartOptions.value.xaxis.categories
      }
    };
  }
};

watch([chartType, selectedReportType], () => {
  updateChartData();
});
  const handleDateRangeChange = (value) => {
    const today = new Date();
    const end = new Date(today);
    let start = new Date(today);
  
    if (value === "custom") return;
  
    switch (value) {
      case "last-month":
        start.setMonth(today.getMonth() - 1);
        break;
      case "last-3-months":
        start.setMonth(today.getMonth() - 3);
        break;
      case "last-year":
        start.setFullYear(today.getFullYear() - 1);
        break;
    }
  
    filters.start = start.toISOString().split("T")[0];
    filters.end = end.toISOString().split("T")[0];
  };
  
  const handleDateChange = (date) => {
  if (date === filters.end) {
    const endDate = new Date(date);
    // Establecer la hora al final del día en la zona horaria local
    endDate.setHours(23, 59, 59, 999);
    return endDate.toISOString().split('T')[0];
  }
  return date;
};
  
  const generateReport = async () => {
    if (!isFormValid.value) {
      $toast.warning("Por favor complete todos los campos");
      return;
    }
  
    loading.value = true;
  
    try {
      const response = await backend.get(selectedReportType.value, {
        params: {
          startDate: filters.start,
          endDate: handleDateChange(filters.end),
          groupBy: groupBy.value,
        },
      });
  
      reportData.value = response.data;
      prepareChartData(response.data);
  
      if (response.data.length === 0) {
        $toast.info("No se encontraron datos para el reporte");
      }
    } catch (error) {
      console.error("Error generando reporte:", error);
      $toast.error("Error al generar el reporte");
    } finally {
      loading.value = false;
    }
  };
  
  const prepareChartData = (data) => {
  if (!data || data.length === 0) {
    chartSeries.value = [{ name: 'Sin Datos', data: [0] }];
    chartOptions.value.xaxis.categories = ['Sin datos'];
    return;
  }

  try {
    if (!isAnimalReport.value) {
      // Agrupar por veterinario para el gráfico
      const groupedByVet = data.reduce((acc, item) => {
        const vetName = `${item.nombreVeterinario} ${item.apellidoVeterinario}`.trim();
        if (!acc[vetName]) {
          acc[vetName] = 0;
        }
        acc[vetName] += Number(item.cantidadTratamientos) || 0;
        return acc;
      }, {});

      // Convertir a arrays para el gráfico
      const categories = Object.keys(groupedByVet);
      const seriesData = Object.values(groupedByVet);

      // Actualizar las opciones del gráfico
      chartOptions.value = {
        ...chartOptions.value,
        chart: {
          type: chartType.value,
          height: 350,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
          }
        },
        colors: [
          '#014582', '#0A5B8A', '#147192', '#1E879A',
          '#289DA2', '#32B3AA', '#3CC9B2', '#46DFBA'
        ],
        xaxis: {
          type: 'category',
          categories: categories,
          labels: {
            rotate: -45,
            trim: true,
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Cantidad de Tratamientos'
          }
        },
        title: {
          text: 'Tratamientos por Veterinario',
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600
          }
        },
        plotOptions: {
          bar: {
            distributed: true,
            borderRadius: 6,
            columnWidth: '45%'
          }
        }
      };

      // Actualizar series del gráfico
      chartSeries.value = [{
        name: 'Tratamientos',
        data: seriesData
      }];

      // Ordenar datos por fecha para la tabla
      reportData.value = data
        .map(item => ({
          ...item,
          fechaTratamiento: item.fechaTratamiento || item.fechaModificacion
        }))
        .sort((a, b) => new Date(b.fechaTratamiento) - new Date(a.fechaTratamiento));

    } else {
      // Mantener la lógica existente para reportes de animales
      const animalData = data.map(item => ({
        fecha: formatDate(item.fechaModificacion || new Date()),
        especie: item.especie || '',
        raza: item.raza || '',
        edad: item.edad || '',
        motivoConsulta: item.motivoConsulta || '',
        diagnostico: item.diagnostico || ''
      }));

      // Agrupar por fecha para el gráfico
      const groupedByDate = animalData.reduce((acc, item) => {
        if (!acc[item.fecha]) {
          acc[item.fecha] = 0;
        }
        acc[item.fecha]++;
        return acc;
      }, {});

      const dates = Object.keys(groupedByDate);
      const counts = Object.values(groupedByDate);

      chartOptions.value = {
        ...chartOptions.value,
        chart: {
          type: chartType.value,
          height: 350
        },
        xaxis: {
          type: 'category',
          categories: dates.length > 0 ? dates : ['Sin datos'],
          labels: {
            rotate: -45,
            trim: true
          }
        },
        title: {
          text: selectedReportType.value === "/animales-fallecidos" 
            ? "Animales Fallecidos" 
            : "Animales en Eutanasia"
        }
      };

      chartSeries.value = [{
        name: selectedReportType.value === "/animales-fallecidos" 
          ? 'Animales Fallecidos' 
          : 'Animales en Eutanasia',
        data: counts.length > 0 ? counts : [0]
      }];
    }
  } catch (error) {
    console.error('Error preparing chart data:', error);
    chartSeries.value = [{ name: 'Error', data: [0] }];
    chartOptions.value.xaxis.categories = ['Error'];
  }
};


  
const downloadCSV = () => {
  if (!reportData.value.length) {
    $toast.warning("No hay datos para descargar");
    return;
  }
  
  const getReportFileName = () => {
    switch (selectedReportType.value) {
      case "/animales-fallecidos":
        return "Reporte_Animales_Fallecidos";
      case "/animales-eutanasia":
        return "Reporte_Animales_Eutanasia";
      case "/veterinarios-tratamientos":
        return "Reporte_Tratamientos_Veterinarios";
      default:
        return "Reporte";
    }
  };

  let headers = "";
  let dataRows = [];

  if (isAnimalReport.value) {
    headers = "Fecha Modificación,Edad,Especie,Raza,Motivo de Consulta,Diagnóstico";
    dataRows = reportData.value.map(
      (item) =>
        `${formatDate(item.fechaModificacion)},${item.edad},"${item.especie}","${item.raza}","${item.motivoConsulta}","${item.diagnostico}"`
    );
  } else {
    headers = "Fecha Modificación,Veterinario,Cantidad";
    dataRows = reportData.value.map(
      (item) =>
        `${formatDate(item.fechaModificacion)},"${item.nombreVeterinario} ${item.apellidoVeterinario}",${item.cantidadTratamientos}`
    );
  }

  const csvContent = [headers, ...dataRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  // Agregar la fecha actual al nombre del archivo
  const currentDate = new Date().toISOString().split('T')[0];
  const fileName = `${getReportFileName()}_${currentDate}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  
const formatDate = (date) => {
  if (!date) return "-";
  try {
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
 
    d.setUTCHours(12, 0, 0, 0);
    
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "-";
  }
};
  const getTitleForReportType = () => {
    const selectedReport = reportTypes.find(
      (type) => type.endpoint === selectedReportType.value
    );
    return selectedReport ? selectedReport.label : "Reporte";
  };
  </script>
  
  <style scoped>
  .filters-card {
    background-color: white;
    border: 1px solid #e0e0e0;
  }
  
  .results-card {
    background-color: white;
    border: 1px solid #e0e0e0;
  }
  
  .kpi-card {
    transition: transform 0.2s;
  }
  
  .kpi-card:hover {
    transform: translateY(-2px);
  }
  
  .primary-bg {
    background-color: #e3f2fd;
  }
  
  .secondary-bg {
    background-color: #e8f5e9;
  }
  
  .accent-bg {
    background-color: #fff3e0;
  }
  
  .chart-container {
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .action-button {
    min-width: 150px;
  }
  
  .data-table {
    border: 1px solid #e0e0e0;
  }
  </style>
  