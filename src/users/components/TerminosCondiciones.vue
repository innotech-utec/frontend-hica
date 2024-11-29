<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-h5 text-center">
            Términos y Condiciones
          </v-card-title>
          <v-card-text class="pb-0">
            <div class="terms-content" v-if="pdfLoaded">
              <iframe
                :src="pdfUrl"
                width="100%"
                height="500px"
                frameborder="0"
                @load="handlePdfLoad"
                @error="handlePdfError"
              ></iframe>
            </div>
            <v-alert
              v-if="pdfError"
              type="error"
              text="Error al cargar el PDF"
            ></v-alert>
          </v-card-text>
          <v-card-text>
            <v-checkbox
              v-model="accepted"
              color="primary"
              label="He leído y acepto los términos y condiciones"
            ></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              variant="text"
              @click="rechazar"
            >
              Cerrar sesión
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              :disabled="!accepted"
              @click="aceptar"
            >
              Aceptar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { AuthService } from '@/auth/services/AuthService';

export default {
  name: 'TerminosCondiciones', // Cambiado para coincidir con el router
 
  data() {
    return {
      accepted: false,
      pdfUrl: `${window.location.origin}/terminos-y-condiciones.pdf`,
      pdfLoaded: false,
      pdfError: false
    }
  },

  methods: {
    async aceptar() {
      try {
        await AuthService.aceptarTerminos();
        this.$router.push('/home'); // Cambiado a /home que es una ruta que existe
      } catch (error) {
        console.error('Error al aceptar términos:', error);
      }
    },

    rechazar() {
      localStorage.clear();
      this.$router.push('/login');
    },

    handlePdfLoad() {
      this.pdfLoaded = true;
      this.pdfError = false;
      console.log('PDF cargado correctamente');
    },

    handlePdfError() {
      this.pdfError = true;
      this.pdfLoaded = false;
      console.error('Error al cargar el PDF');
    }
  },

  mounted() {
    console.log('Componente de términos montado');
    console.log('URL del PDF:', this.pdfUrl);
    // Verificar si el archivo existe
    fetch(this.pdfUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('PDF no encontrado');
        }
        this.pdfLoaded = true;
      })
      .catch(error => {
        console.error('Error cargando PDF:', error);
        this.pdfError = true;
      });
  }
}
</script>