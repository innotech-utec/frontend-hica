<template>
  <v-dialog v-model="localShowModal" max-width="600px">
    <v-card class="generic-modal">
      <v-card-title class="primary-title text-center">Editar Examen Objetivo</v-card-title>
      <v-card-text class="justified-text">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <!-- Columna izquierda -->
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="localExamenObjetivo.FC"
                label="Frecuencia Cardíaca (FC)"
                :rules="requiredRule"
                @blur="validateNumber('FC')"
                required
                 @keypress="onlyNumbers"
                :error-messages="errors.FC"
              ></v-text-field>
              
              <v-text-field
                v-model="localExamenObjetivo.Resp"
                label="Frecuencia Respiratoria (FR)"
                :rules="requiredRule"
                @blur="validateNumber('Resp')"
                required
                 @keypress="onlyNumbers"
                :error-messages="errors.Resp"
              ></v-text-field>
              
              <v-text-field
                v-model="localExamenObjetivo.temperatura"
                label="Temperatura (°C)"
                :rules="requiredRule"
                @blur="validateNumber('temperatura')"
                required
                 @keypress="onlyNumbers"
                :error-messages="errors.temperatura"
              ></v-text-field>

              <v-select
                v-model="localExamenObjetivo.condicionCorporal"
                label="Condición Corporal"
                :items="[1,2,3,4,5,6,7,8,9]"
                :rules="requiredRule"
              ></v-select>
              
              <v-select
                v-model="localExamenObjetivo.sensorio"
                label="Sensorio"
                :items="['NORMAL', 'ALERTA', 'DEPRIMIDO', 'OTROS']"
                :rules="requiredRule"
              ></v-select>
            </v-col>

            <!-- Columna derecha -->
            <v-col cols="12" md="6">
              <v-select
                v-model="localExamenObjetivo.fascies"
                label="Fascies"
                :items="['SP', 'DOLOR', 'ANSIEDAD', 'ANGUSTIA']"
                :rules="requiredRule"
              ></v-select>
              
              <v-select
                v-model="localExamenObjetivo.gangliosLinfaticos"
                label="Ganglios Linfáticos"
                :items="['SP', 'AUMENTADOS']"
                :rules="requiredRule"
              ></v-select>

              <v-select
                v-model="localExamenObjetivo.mucosasAparentesTipo"
                label="Tipo de Mucosas"
                :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
                :rules="requiredRule"
              ></v-select>

              <v-select
                v-model="localExamenObjetivo.mucosasAparentesEstado"
                label="Estado de Mucosas"
                :items="['HUMEDAS', 'SECAS']"
                :rules="requiredRule"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Campos de texto largo -->
          <v-textarea 
            v-model="localExamenObjetivo.pielSubcutaneo" 
            label="Piel y Subcutáneo"
             :rules="DatosRulesNorequiered"
  @blur="normalizeText('pielSubcutaneo')"
            
          ></v-textarea>
          
          <v-textarea 
            v-model="localExamenObjetivo.grandesFuncionales" 
            label="Grandes Funcionales"
            :rules="DatosRulesNorequiered"
            @blur="normalizeText('grandesFuncionales')"
           
          ></v-textarea>
          
          <v-textarea 
            v-model="localExamenObjetivo.actitudesAnomalas" 
            label="Actitudes Anómalas"
             :rules="DatosRulesNorequiered"
  @blur="normalizeText('actitudesAnomalas')"
          ></v-textarea>
          
          <v-textarea 
            v-model="localExamenObjetivo.EOP" 
            label="EOP"
            :rules="DatosRulesNorequiered"
  @blur="normalizeText('EOP')"

          ></v-textarea>
          
          <v-textarea 
            v-model="localExamenObjetivo.paraclinicos" 
            label="Paraclínicos"
            :rules="DatosRulesNorequiered"
  @blur="normalizeText('paraclinicos')"
          ></v-textarea>
          
          <v-textarea 
            v-model="localExamenObjetivo.diagnostico" 
            label="Diagnóstico"
          :rules="DatosRules"
          @blur="normalizeText('diagnostico')"
          ></v-textarea>
          
          <v-textarea 
            v-model="localExamenObjetivo.observaciones" 
            label="Observaciones"
            :rules="DatosRulesNorequiered"
           @blur="normalizeText('observaciones')"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="onSubmit" :loading="loading" :disabled="!valid">Guardar</v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  name: "EditExamenObjetivo",
  props: {
    fichaClinicaId: { type: String, required: true },
    showModal: { type: Boolean, required: true },
    examenObjetivo: { type: Object, required: true }
  },
  data() {
    return {
      valid: false,
      loading: false,
      localShowModal: this.showModal,
      localExamenObjetivo: { ...this.examenObjetivo },
      errors: { FC: '', Resp: '', temperatura: '' },
      validations: {  
        FC: true,
        Resp: true,
        temperatura: true
      },
      requiredRule: [(v) => !!v || "Este campo es requerido"],
      DatosRules: [
        v => !!v || 'Este campo es requerido',
        v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
        v => v && v.trim().length > 0 || 'El campo no puede contener solo espacios',
        v => (v && v.length >= 2 && v.length <= 50) || 'El campo debe tener entre 2 y 50 caracteres',
       
      ],
     
      DatosRulesNorequiered: [
  v => !v || (v && !v.includes('  ')) || 'El campo no puede contener espacios dobles',
  v => !v || (v && v.trim().length > 0) || 'El campo no puede contener solo espacios',
 
]
  
    };
  },
  watch: {
    showModal(val) { 
      this.localShowModal = val; 
    },
    examenObjetivo: { 
      immediate: true, 
      handler(newVal) { 
        this.localExamenObjetivo = { ...newVal }; 
      } 
    },
    localShowModal(val) { 
      if (!val) {
        this.$emit("closeModal");
        this.resetErrors();
      }
    }
  },
  methods: {
    validateNumber(field) {
      this.errors[field] = [];
      const value = this.localExamenObjetivo[field];

      if (!value) {
        this.errors[field].push(`El ${field} es requerido`);
      } else if (value <= 0) {
        this.errors[field].push(`El ${field} debe ser mayor que 0`);
      }

      this.validations[field] = this.errors[field].length === 0;
    },
    normalizeText(field) {
      if (this.localExamenObjetivo[field]) {
        this.localExamenObjetivo[field] = this.localExamenObjetivo[field].toUpperCase().trim();
      }
    },
    onlyNumbers(event) {
      const charCode = event.which ? event.which : event.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        event.preventDefault();
      }
    },
   
    
    async onSubmit() {
      // Validar todos los campos numéricos
     /* const isFC = this.validateNumber('FC');
      const isResp = this.validateNumber('Resp');
      const isTemp = this.validateNumber('temperatura');

      if (!this.$refs.form.validate() || !isFC || !isResp || !isTemp) {
        Swal.fire({
          icon: "warning",
          title: "Validación",
          text: "Por favor revise los campos marcados con error.",
          customClass: { popup: "swal-popup-zindex" }
        });
        return;
      }*/

      if (!this.localExamenObjetivo.id) {
        Swal.fire("Error", "No se encontró el ID del examen objetivo.", "error");
        return;
      }

      this.loading = true;
      try {
        await backend.patch(
          `/examenObjetivo/${this.localExamenObjetivo.id}`, 
          this.localExamenObjetivo,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        
        this.$emit("examenActualizado");
        Swal.fire("Examen Objetivo Actualizado", "Los cambios han sido guardados.", "success");
        this.closeModal();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "No se pudo actualizar el examen objetivo.",
          icon: "error",
          customClass: { popup: "swal-popup-zindex" }
        });
      } finally {
        this.loading = false;
      }
    },
    
    closeModal() {
      this.localShowModal = false;
      this.$emit("closeModal");
    },
    
    
    resetErrors() {
      this.errors = { FC: '', Resp: '', temperatura: '' };
    }
  }
};
</script>

<style scoped>
.page-title { 
  font-size: 28px; 
  color: #014582; 
  font-weight: bold; 
  margin: 10px 0; 
}

.add-user-btn { 
  background-color: #014582 !important; 
  color: white !important; 
}

.swal-popup-zindex {
  z-index: 3000 !important; 
}

.justified-text {
  text-align: justify;
}

.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}
</style>