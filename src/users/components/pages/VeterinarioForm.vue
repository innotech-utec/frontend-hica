<template>
    <v-card class="card">
      <v-form @submit.prevent="onSubmitVeterinario">
        <v-container>
          <div class="field">
            <v-icon class="field__icon">mdi-numeric</v-icon>
            <input class="field__input" v-model.number="N_de_registro" type="number" placeholder="Número de registro" />
          </div>
          <div class="field">
            <v-icon class="field__icon">mdi-checkbox-marked-circle</v-icon>
            <input class="field__input" type="checkbox" v-model="Validado" />
            <label>Validado</label>
          </div>
          <div class="field">
            <v-icon class="field__icon">mdi-home</v-icon>
            <input class="field__input" v-model="Dependencia" type="text" placeholder="Dependencia" />
          </div>
          <div class="field">
            <v-icon class="field__icon">mdi-camera</v-icon>
            <!-- Captura de archivos mediante evento change -->
            <input class="field__input" type="file" @change="onFileSelected" />
          </div>
          <v-btn type="submit" color="primary">Guardar</v-btn>
        </v-container>
      </v-form>
    </v-card>
  </template>
  
  <script>
  export default {
    data() {
      return {
        N_de_registro: '',  // Debería ser una cadena vacía inicialmente, pero se puede convertir a número
        Validado: false,
        Dependencia: '',
        Foto: null  // Aquí se almacenará el archivo seleccionado
      };
    },
    methods: {
      onFileSelected(event) {
        this.Foto = event.target.files[0];  // Almacena el archivo seleccionado en la propiedad 'Foto'
      },
  
      onSubmitVeterinario() {
        // Emitir los datos del veterinario hacia el componente padre
        this.$emit('input', {
          N_de_registro: this.N_de_registro,
          Validado: this.Validado,
          Dependencia: this.Dependencia,
          Foto: this.Foto
        });
      }
    }
  }
  </script>
  