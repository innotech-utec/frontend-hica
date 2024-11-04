<template>
  <v-dialog 
    :model-value="localShowModal" 
    @update:model-value="updateModalState" 
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ articuloSeleccionado ? 'Editar' : 'Agregar' }} Gasto a Factura</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="selectedArticulo"
                  :items="articulosDisponibles"
                  item-title="nombre"
                  item-value="id"
                  label="Artículo"
                  :rules="[v => !!v || 'El artículo es requerido']"
                  :loading="loadingArticulos"
                  required
                ></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model.number="cantidad"
                  label="Cantidad"
                  type="number"
                  min="1"
                  :rules="[
                    v => !!v || 'La cantidad es requerida',
                    v => v > 0 || 'La cantidad debe ser mayor a 0',
                    v => Number.isInteger(Number(v)) || 'La cantidad debe ser un número entero'
                  ]"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-if="selectedArticulo">
                <v-text-field
                  v-model="valorUnitario"
                  label="Valor Unitario"
                  prefix="$"
                  readonly
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-if="selectedArticulo">
                <v-text-field
                  :value="totalFormateado"
                  label="Total"
                  prefix="$"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn 
          color="error" 
          @click="handleClose"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn 
          color="primary" 
          @click="guardarGasto"
          :disabled="!valid || loading"
          :loading="loading"
        >
          {{ articuloSeleccionado ? 'Actualizar' : 'Guardar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';
import { adjustStock } from '@/facturas/Services/facturaService';

export default {
  name: 'AddGastosModal',
  
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    fichaClinicaId: {
      type: String,
      required: true
    },
    facturaId: {
      type: String,
      required: true
    },
    articuloSeleccionado: {
      type: Object,
      default: null
    }
  },

  emits: ['update:showModal', 'close', 'updated'],

  data() {
    return {
      localShowModal: this.showModal,
      valid: false,
      selectedArticulo: null,
      cantidad: 1,
      articulosDisponibles: [],
      valorUnitario: 0,
      loading: false,
      loadingArticulos: false
    };
  },

  computed: {
    total() {
      return this.valorUnitario * this.cantidad;
    },
    
    totalFormateado() {
      const totalValue = this.total || 0;
      return totalValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  },

  watch: {
    showModal(val) {
      this.localShowModal = val;
      if (val) {
        this.resetForm();
        this.fetchArticulosDisponibles();
      }
    },

    selectedArticulo(val) {
      if (val) {
        const articulo = this.articulosDisponibles.find(a => a.id === val);
        if (articulo) {
          this.valorUnitario = articulo.valor;
        }
      } else {
        this.valorUnitario = 0;
      }
    },

    articuloSeleccionado(val) {
      if (val) {
        this.selectedArticulo = val.id;
        this.cantidad = val.factura_articulos?.cantidad || 1;
        this.valorUnitario = val.valor;
      }
    }
  },

  methods: {
    showError(message) {
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        customClass: {
          container: 'swal2-container-high-z-index'
        }
      });
    },

    async fetchArticulosDisponibles() {
      this.loadingArticulos = true;
      try {
        const response = await backend.get('/articulos');
        this.articulosDisponibles = response.data;
      } catch (error) {
        console.error('Error al cargar artículos:', error);
        await this.showError('No se pudieron cargar los artículos disponibles');
      } finally {
        this.loadingArticulos = false;
      }
    },

    async guardarGasto() {
      if (!this.facturaId || !this.selectedArticulo) {
        await this.showError('Datos incompletos. Verifique la información.');
        return;
      }

      const articulo = this.articulosDisponibles.find(a => a.id === this.selectedArticulo);
      if (!articulo) {
        await this.showError('Artículo no encontrado');
        return;
      }

      const stockDisponible = articulo.stock;
      const cantidadDeseada = this.cantidad;
      const cantidadActualEnFactura = this.articuloSeleccionado?.factura_articulos?.cantidad || 0;

      if (cantidadDeseada > cantidadActualEnFactura && (cantidadDeseada - cantidadActualEnFactura) > stockDisponible) {
        await this.showError(`Stock insuficiente. Stock disponible: ${stockDisponible}. No puedes añadir más de la cantidad disponible.`);
        return;
      }

      this.loading = true;

      try {
        await adjustStock({
          articuloId: this.selectedArticulo,
          facturaId: this.facturaId,
          cantidad: this.cantidad
        });

        await backend.post(
          `/facturas/${this.facturaId}/articulos/${this.selectedArticulo}`,
          {
            cantidad: this.cantidad,
            facturaId: this.facturaId
          }
        );

        await this.fetchArticulosDisponibles();

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Artículo ${this.articuloSeleccionado ? 'actualizado' : 'agregado'} correctamente`,
          customClass: {
            container: 'swal2-container-high-z-index'
          }
        });

        this.$emit('updated');
        this.handleClose();
      } catch (error) {
        await this.showError(error.message || 'Error al procesar la operación');
      } finally {
        this.loading = false;
      }
    },

    updateModalState(val) {
      this.localShowModal = val;
      if (!val) {
        this.handleClose();
      }
    },

    handleClose() {
      this.$emit('update:showModal', false);
      this.$emit('close');
      this.resetForm();
    },

    resetForm() {
      this.selectedArticulo = null;
      this.cantidad = 1;
      this.valorUnitario = 0;
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    }
  },

  mounted() {
    this.fetchArticulosDisponibles();
  }
};
</script>

<style>
.swal2-container-high-z-index {
  z-index: 9999 !important;
}

.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
}

.v-text-field[readonly] {
  color: #000;
}
</style>