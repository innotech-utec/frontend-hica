<template>
  <v-container>
    <BackButton />
    <v-alert
      v-if="alert.show"
      :type="alert.type"
      :text="alert.message"
      class="mb-4"
      closable
      @click:close="closeAlert"
    ></v-alert>

    <!-- Título de la página -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Facturación</h2>
      </v-col>
    </v-row>

    <!-- Información del animal -->
    <v-card flat class="mb-4" v-if="animal && animal.nombre">
      <v-card-title class="info-title">Información del Animal</v-card-title>
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

        <!-- Información del responsable -->
    <v-card flat class="mb-4" v-if="responsable && responsable.id">
      <v-card-title class="info-title">Información del Responsable</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Nombre:</label>
              <div class="field-value">{{ responsable.nombre || '-' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Apellido:</label>
              <div class="field-value">{{ responsable.apellido || '-' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-group">
              <label class="field-label">Contacto:</label>
              <div class="field-value">{{ responsable.telefono || '-' }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Acciones de facturación -->
    <v-card class="mb-4">
      <v-card-actions>
        <v-btn color="primary" @click="openAddGastosModal()" :disabled="!facturaId">
          <v-icon start>mdi-plus</v-icon>
          Agregar Gastos
        </v-btn>
        <v-btn
  color="success"
  class="ml-2"
  @click="imprimirFactura"
  :disabled="!facturaId || articulos.length === 0"
>
  <v-icon start>mdi-printer</v-icon>
  Imprimir Comprobante
</v-btn>
        
      </v-card-actions>
    </v-card>

    <!-- Tabla de artículos -->
    <v-card v-if="articulos.length > 0">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Nombre Artículo</th>
              <th>Cantidad</th>
              <th>Valor Unitario</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="articulo in articulos" :key="articulo.id">
              <td>{{ articulo.nombre }}</td>
              <td>{{ articulo.factura_articulos?.cantidad || 0 }}</td>
              <td>${{ formatPrice(articulo.valor) }}</td>
              <td>${{ formatPrice(articulo.valor * (articulo.factura_articulos?.cantidad || 0)) }}</td>
              <td>
                <v-btn icon @click="openAddGastosModal(articulo)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right font-weight-bold">Total General:</td>
              <td class="font-weight-bold">${{ formatPrice(totalGeneral) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </v-table>
      </v-card-text>
    </v-card>
    <p v-else class="text-center mt-4">No hay artículos cargados en el comprobante.</p>

    <!-- Modal para agregar gastos -->
    <AddGastosModal
      v-model:showModal="showAddGastosModal"
      :fichaClinicaId="fichaClinicaId"
      :facturaId="facturaId"
      :articuloSeleccionado="articuloSeleccionado"
      @close="closeAddGastosModal"
      @updated="fetchArticulos"
    />

    <!-- Paginación -->
    <div class="pagination-container">
      <PaginatorComponent
        :length="totalPages"
        :currentPage="currentPage"
        @pageChange="handlePageChange"
      />
    </div>
  </v-container>
</template>

<script>
import { jsPDF } from 'jspdf';
import AddGastosModal from './AddGastosModal.vue';
import backend from '@/backend';
import Swal from 'sweetalert2';
import BackButton from '@/shared/components/BackButton.vue';
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {
  name: 'IndexFacturaPage',
  components: {
    AddGastosModal, 
    BackButton,
    PaginatorComponent,
  },
  data() {
    return {
      animal: null,
      responsable: null,
      articulos: [],
      showAddGastosModal: false,
      articuloSeleccionado: null,
      facturaId: null,
      fichaClinicaId: null,
      alert: {
        show: false,
        type: 'info',
        message: ''
      },
      institucionalInfo: {
        nombre: 'Facultad de Veterinaria',
        universidad: 'Universidad de la República Uruguay',
        direccion: 'Ruta 8 Km. 18, Montevideo',
        correo: 'informacionhospital@fvet.edu.uy',
        disclaimer: 'Este documento no es una factura electrónica. Es un comprobante de gastos emitido por la Facultad para su control interno.'
      }
    };
  },
  computed: {
    totalGeneral() {
      return this.articulos.reduce((total, articulo) => total + (articulo.total || 0), 0);
    }
  },
  methods: {
    async fetchData() {
      try {
        const fichaClinicaId = this.$route.params.fichaClinicaId;
        const response = await backend.get(`/fichasClinicas/${fichaClinicaId}`);
        this.animal = response.data.animal;

        if (this.animal.responsableId) {
        try {
          const responsableResponse = await backend.get(`/responsables/${this.animal.responsableId}`);
          this.responsable = responsableResponse.data;
        } catch (error) {
          console.error('Error al obtener responsable:', error);
        }
      }
      } catch (error) {
        console.error('Error fetching data:', error);
        this.alert = {
          show: true,
          type: 'error',
          message: 'Error al cargar los datos del animal y responsable'
        };
      }
    },
    closeAlert() {
      this.alert.show = false;
    },
    formatPrice(value) {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) {
        return '0.00';
      }
      return numberValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    async fetchArticulos() {
      if (!this.facturaId) return;
      try {
        const response = await backend.get(`/facturas/${this.facturaId}/articulos`);
        this.articulos = response.data.map(articulo => ({
          ...articulo,
          cantidad: articulo.factura_articulos?.cantidad || 0,
          total: articulo.valor * (articulo.factura_articulos?.cantidad || 0)
        }));
      } catch (error) {
        console.error('Error fetching articulos:', error);
        this.alert = {
          show: true,
          type: 'error',
          message: 'Error al cargar los artículos'
        };
      }
    },
    openAddGastosModal(articulo = null) {
      this.articuloSeleccionado = articulo;
      this.showAddGastosModal = true;
    },
    closeAddGastosModal() {
      this.showAddGastosModal = false;
      this.articuloSeleccionado = null;
    },
    async generatePDF(factura) {
  if (!factura || !this.articulos.length) {
    console.error('Missing required data for PDF generation');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Header y Logos
  try {
    const fvetLogo = await this.getBase64Image('/FVET_logo.png');
    const hicaLogo = await this.getBase64Image('/HICA_logo.png');
    if (hicaLogo) doc.addImage(hicaLogo, 'PNG', 10, 5, 20, 20);
    if (fvetLogo) doc.addImage(fvetLogo, 'PNG', 170, 5, 20, 20);
  } catch (error) {
    console.error('Error loading logos:', error);
  }

  // Título principal
  yPosition = 40;
  doc.setFontSize(24);
  doc.setTextColor(1, 69, 130); // Color #014582
  doc.text('COMPROBANTE DE GASTOS', pageWidth / 2, yPosition, { align: 'center' });

  // Información institucional
  yPosition += 20;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(this.institucionalInfo.nombre, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  doc.text(this.institucionalInfo.universidad, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  doc.text(this.institucionalInfo.direccion, pageWidth / 2, yPosition, { align: 'center' });

  // Información del Animal
  yPosition += 10;

  // Crear contenedor con fondo suave
  doc.setFillColor(246, 249, 252);
  doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 50, 3, 3, 'F');

  // Título
  doc.setFontSize(11);
  doc.setTextColor(1, 69, 130);
  doc.text('Información del Animal', margin + 5, yPosition + 12);

  // Configurar estilo para los datos
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  // Definir posiciones de columnas
  let col1 = margin + 5;
  let col2 = margin + 85;
  let textY = yPosition + 25;

  // Datos del animal
  doc.text(`Nombre: ${this.animal.nombre || '-'}`, col1, textY);
  doc.text(`Especie: ${this.animal.especie || '-'}`, col2, textY);

  // Datos del responsable
  doc.setTextColor(80, 80, 80);
  doc.text(`Responsable: ${this.responsable?.nombre || '-'} ${this.responsable?.apellido || '-'}`, col1, textY + 12);
  doc.text(`Contacto: ${this.responsable?.telefono || '-'}`, col2, textY + 12);

  // Actualizar posición Y
  yPosition += 40;

  // Línea separadora
  yPosition += 15;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Número de comprobante y fecha
  yPosition += 10;
  doc.text(`Comprobante Nº: ${factura.id}`, margin, yPosition);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 70, yPosition);

  // Tabla de artículos
  yPosition += 10;
  doc.autoTable({
    startY: yPosition,
    head: [['Artículo', 'Cantidad', 'Precio Unit.', 'Total']],
    body: this.articulos.map(articulo => [
      articulo.nombre,
      articulo.factura_articulos?.cantidad || 0,
      `$${this.formatPrice(articulo.valor)}`,
      `$${this.formatPrice(articulo.valor * (articulo.factura_articulos?.cantidad || 0))}`
    ]),
    headStyles: {
      fillColor: [1, 69, 130],
      textColor: [255, 255, 255],
      fontSize: 12,
      cellPadding: 6
    },
    bodyStyles: {
      fontSize: 11,
      cellPadding: 6
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    }
  });

  // Total
  yPosition = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total General: $${this.formatPrice(this.totalGeneral)}`, pageWidth - 60, yPosition);

  return doc;
},
    async imprimirFactura() {
      if (!this.facturaId) return;

      try {
        const result = await Swal.fire({
          text: "¿Desea generar la descarga de su comprobante?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#014582',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cerrar comprobante',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          Swal.fire({
            title: 'Procesando...',
            text: 'Generando el comprobante',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const doc = await this.generatePDF({
            id: this.facturaId,
            total: this.totalGeneral
          });

          if (doc) {
            doc.save(`comprobante-${this.facturaId}.pdf`);
            Swal.close();

            await Swal.fire({
              title: '¡Éxito!',
              text: 'Comprobante generado exitosamente',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          }
        }
      } catch (error) {
        console.error('Error generating PDF:', error);

        await Swal.fire({
          title: 'Error',
          text: 'Error al generar el comprobante. Por favor, intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    },
    async getBase64Image(url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        throw new Error(`Error loading image: ${error.message}`);
      }
    }
  },
  async mounted() {
    this.facturaId = this.$route.params.facturaId;
    this.fichaClinicaId = this.$route.params.fichaClinicaId;
    await this.fetchData();
    await this.fetchArticulos();
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
.info-card {
  background-color: #f8f9fa !important;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.animal-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animal-details, .responsable-details {
  display: inline-flex;
  align-items: center;
  color: #2c3e50;
  font-size: 0.95rem;
}

.v-divider.vertical {
  height: 20px;
  border-color: #dee2e6;
}

.mx-2 {
  margin: 0 8px;
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
