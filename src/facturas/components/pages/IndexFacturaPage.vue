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

    <!-- Información del animal y responsable -->
    <v-card-subtitle v-if="animal && responsable">
      <span>Animal: {{ animal.nombre }} - {{ animal.especie }} - {{ animal.raza }}</span>
      <br>
      <span>Responsable: {{ responsable.nombre || 'Sin responsable' }} {{ responsable.apellido || '' }}</span>
    </v-card-subtitle>

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
  props: {
    animal: {
      type: Object,
      default: () => ({})
    },
    responsable: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
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
    formatPrice(value) {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) {
        return '0.00';
      }
      return numberValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },

    async fetchArticulos() {
      if (!this.facturaId) return;
      const response = await backend.get(`/facturas/${this.facturaId}/articulos`);
      this.articulos = response.data.map(articulo => ({
        ...articulo,
        cantidad: articulo.factura_articulos?.cantidad || 0,
        total: articulo.valor * (articulo.factura_articulos?.cantidad || 0)
      }));
    },

    openAddGastosModal(articulo = null) {
      this.articuloSeleccionado = articulo;
      this.showAddGastosModal = true;
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

      try {
        const fvetLogo = await this.getBase64Image('/FVET_logo.png');
        const hicaLogo = await this.getBase64Image('/HICA_logo.png');
        if (hicaLogo) doc.addImage(hicaLogo, 'PNG', 10, 5, 20, 20);
        if (fvetLogo) doc.addImage(fvetLogo, 'PNG', 170, 5, 20, 20);
      } catch (error) {
        console.error('Error loading logos:', error);
      }

      yPosition += 30;
      doc.setFontSize(20);
      doc.setTextColor(50, 100, 200);
      doc.text('COMPROBANTE DE GASTOS', pageWidth / 2, yPosition, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      yPosition += 15;
      doc.setFontSize(12);
      doc.text(this.institucionalInfo.nombre, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
      doc.text(this.institucionalInfo.universidad, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
      doc.text(this.institucionalInfo.direccion, pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;
      doc.setDrawColor(50, 100, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 15;
      doc.setFontSize(11);
      doc.text(`Comprobante Nº: ${factura.id || 'N/A'}`, margin, yPosition);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, yPosition);

      yPosition += 15;
      if (this.responsable && this.responsable.nombre) {
        const responsableText = `Responsable: ${this.responsable.nombre} ${this.responsable.apellido || ''}`;
        doc.text(responsableText, margin, yPosition);
        yPosition += 10;
      }

      if (this.animal) {
        const animalText = `Animal: ${this.animal.nombre || 'N/A'} - ${this.animal.especie || 'N/A'} - ${this.animal.raza || 'N/A'}`;
        doc.text(animalText, margin, yPosition);
        yPosition += 15;
      }

      const headers = [['Artículo', 'Cantidad', 'Precio Unit.', 'Total']];
      const data = this.articulos.map(articulo => [
        articulo.nombre || '',
        (articulo.factura_articulos?.cantidad || '0').toString(),
        `$${this.formatPrice(articulo.valor || 0)}`,
        `$${this.formatPrice((articulo.valor || 0) * (articulo.factura_articulos?.cantidad || 0))}`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: headers,
        body: data,
        margin: { left: margin },
        headStyles: {
          fillColor: [50, 100, 200],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'normal',
          cellPadding: 3,
          minCellHeight: 10
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total General: $${this.formatPrice(this.totalGeneral)}`, pageWidth - margin - 40, yPosition);

      yPosition = doc.internal.pageSize.height - 40;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      doc.text(this.institucionalInfo.disclaimer, pageWidth / 2, yPosition, {
        align: 'center',
        maxWidth: pageWidth - (margin * 2)
      });

      yPosition += 10;
      doc.text(this.institucionalInfo.direccion, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text(this.institucionalInfo.correo, pageWidth / 2, yPosition, { align: 'center' });

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
  mounted() {
    this.facturaId = this.$route.params.facturaId;
    this.fichaClinicaId = this.$route.params.fichaClinicaId;
    this.fetchArticulos();
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
</style>
