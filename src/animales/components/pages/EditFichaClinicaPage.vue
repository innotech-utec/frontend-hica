<template>
  <v-card>
    <v-card-title class="primary-title text-center">Editar Ficha Clínica</v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit" lazy-validation>
        <v-text-field 
          v-model="fichaClinica.motivoConsulta" 
          label="Motivo de la Consulta" 
          @blur="normalizeText('motivoConsulta')"
          :rules="DatosRules"
          required
        ></v-text-field>
        
        <v-select
          v-model="fichaClinica.sanitaria"
          :items="opcionesSanitarias"
          label="Condición Sanitaria"
          :rules="requiredRule"
          required
          background-color="white"
        ></v-select>

        <v-select
          v-model="fichaClinica.ambiental"
          :items="opcionesAmbientales"
          label="Condición Ambiental"
          :rules="requiredRule"
          required
          background-color="white"
        ></v-select>

        <v-text-field 
          v-model="fichaClinica.remotaFisiologica" 
          label="Remota Fisiológica" 
          :rules="DatosRules"
          @blur="normalizeText('remotaFisiologica')"
          required
        ></v-text-field>

        <v-text-field 
          v-model="fichaClinica.remotaPatologica" 
          label="Remota Patológica" 
          :rules="DatosRules"
          @blur="normalizeText('remotaPatologica')"
          required
        ></v-text-field>

        <v-text-field 
          v-model="fichaClinica.proximaFisiologica" 
          label="Próxima Fisiológica" 
          :rules="DatosRules"
          @blur="normalizeText('proximaFisiologica')"
          required
        ></v-text-field>

        <v-text-field 
          v-model="fichaClinica.proximaPatologica" 
          label="Próxima Patológica" 
          :rules="DatosRules"
          @blur="normalizeText('proximaPatologica')"
          required
        ></v-text-field>

        <v-select 
          v-model="fichaClinica.estadoFichaClinica" 
          :items="['ALTA', 'INGRESADO', 'INTERNADO', 'FALLECIMIENTO', 'EUTANASIA']" 
          label="Estado de la Ficha" 
          :rules="requiredRule"
          required
          background-color="white"
        ></v-select>

        <v-card-actions class="justify-end">
          <v-btn rounded color="primary" type="submit" :disabled="!valid">Guardar</v-btn>
          <v-btn rounded color="secondary" @click="cancelarEdicion">Cancelar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  name: "EditFichaClinicaPage",
  props: {
    fichaClinicaId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      valid: false,
      requiredRule: [
        v => !!v || 'Este campo es requerido',
        v => v.trim().length > 0 || 'El campo no puede estar vacío'
      ],
      DatosRules: [
      v => !!v || 'Este campo es requerido',
      v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
      v => v && v.trim().length > 0 || 'El campo no puede contener solo espacios',
      v => (v && v.length >= 1 && v.length <= 60) || 'El campo debe tener entre 1 y 60 caracteres',
    ],
      opcionesSanitarias: [
        'VACUNADO/DESPARASITADO',
        'VACUNADO/NO DESPARASITADO',
        'NO VACUNADO/NO DESPARASITADO',
        'NO VACUNADO/DESPARASITADO'
      ],
      opcionesAmbientales: [
        'BOX/A CAMPO',
        'BOX',
        'A CAMPO',
        'A CORRAL'
      ],
      fichaClinica: {
        motivoConsulta: '',
        sanitaria: '',
        ambiental: '',
        remotaFisiologica: '',
        remotaPatologica: '',
        proximaFisiologica: '',
        proximaPatologica: '',
        estadoFichaClinica: 'INGRESADO',
      },
    };
  },
  methods: {

    normalizeText(field) {
  if (this.fichaClinica[field]) {
    this.fichaClinica[field] = this.fichaClinica[field].toUpperCase().trim();
    }
  },
    async fetchFichaClinica() {
      try {
        const response = await backend.get(`/fichasClinicas/${this.fichaClinicaId}`);
        this.fichaClinica = response.data;
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la ficha clínica.',
        });
      }
    },
    async onSubmit() {
      this.$refs.form.validate();
      const fieldsToNormalize = [
      'motivoConsulta',
      'remotaFisiologica',
      'remotaPatologica', 
      'proximaFisiologica',
      'proximaPatologica'
    ];
    fieldsToNormalize.forEach(field => this.normalizeText(field));
      
      if (!this.valid) {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Por favor, complete todos los campos requeridos.",
        });
        return;
      }

      try {
        await backend.patch(`/fichasClinicas/${this.fichaClinicaId}`, this.fichaClinica);
        this.$emit('fichaActualizada');
        Swal.fire('Ficha Clínica Actualizada', 'Los cambios han sido guardados.', 'success');
        this.$emit('closeModal');
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar la ficha clínica.', 'error');
      }
    },
    cancelarEdicion() {
      this.$emit('closeModal');
    }
  },
  created() {
    this.fetchFichaClinica();
  },
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
.v-btn.rounded {
  background-color: #014582;
  color: white;
}
.v-btn.rounded:hover {
  background-color: #013262;
}
.v-btn.secondary {
  background-color: #008575;
}
.v-btn.secondary:hover {
  background-color: #007460;
}

.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}
</style>