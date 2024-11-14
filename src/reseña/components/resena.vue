<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import backend from "@/backend";
import { useRoute, useRouter} from 'vue-router';
import { 
  VpEditor, 
  useAllTools, 
  urlToBlob, 
  createSettings
} from 'vue-paint'
import 'vue-paint/themes/default.css'

// Importar la imagen
import templateImage from '@/assets/img/template.png'

// Configuración de herramientas con imagen de fondo
const { tools } = useAllTools({ 
  backgroundImage: urlToBlob(templateImage)
})

// Estado del editor
const history = ref([])
const settings = createSettings(tools, {
  color: '#FF0000',
  thickness: 2
})

// Referencia al editor para capturarlo
const editorRef = ref(null)
const isLoading = ref(false)
const error = ref(null)
const successMessage = ref(null)

const resetCanvas = () => {
  const backgroundElement = history.value.find(item => item.type === 'background')
  if (backgroundElement) {
    history.value = [backgroundElement]
  } else {
    history.value = []
  }
}

const route = useRoute();
const router = useRouter();
const fichaClinicaId = route.query.fichaClinicaId;
const animalId = route.query.animalId;


const handleSave = async () => {
  try {
    console.log('1. Iniciando proceso...');
    isLoading.value = true;
    error.value = null;
    successMessage.value = null; // Limpiar mensaje previo

    const editorElement = editorRef.value.$el || editorRef.value;
    const svgElement = editorElement.querySelector('svg');

    // Calcular dimensiones
    const originalWidth = 963;
    const originalHeight = 481;
    const scale = 0.5;

    const targetWidth = Math.floor(originalWidth * scale);
    const targetHeight = Math.floor(originalHeight * scale);

    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Convertir SVG a imagen
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svg);

    // Dibujar en canvas
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });

    
    const base64Image = canvas.toDataURL('image/png').split(',')[1];
    console.log('Tamaño de la imagen en base64:', base64Image.length);
    
   
  
    const response = await backend.post('/upload', {
      imagen: base64Image,
      fichaClinicaId: fichaClinicaId  // sin .value
    });

    console.log('Respuesta del backend:', response.data);
    successMessage.value = 'Reseña guardada exitosamente';

    setTimeout(() => {
      // Navegar de vuelta a la ficha con todos los parámetros
      router.push({
        path: '/animales/ficha-clinica',
        query: {
          fichaClinicaId: fichaClinicaId,
          animalId: animalId
        }
      });
    }, 1500);
    
  } catch (error) {
    console.error('Error:', error);
    error.value = 'Error al guardar la reseña: ' + error.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">
        Reseña Gráfica Equina
      </v-card-title>
      
      <v-card-text>
        <div class="d-flex justify-center">
          <vp-editor 
            ref="editorRef"
            v-model:history="history" 
            v-model:settings="settings" 
            @save="handleSave" 
            :tools="tools"
            :width="963"
            :height="481"
            class="editor-container"
          />
        </div>
        
        <!-- Mensaje de éxito -->
        <v-alert
          v-if="successMessage"
          type="success"
          class="mt-3"
          closable
        >
          {{ successMessage }}
        </v-alert>

        <!-- Mensaje de error -->
        <v-alert
          v-if="error"
          type="error"
          class="mt-3"
          closable
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          @click="resetCanvas"
          :disabled="isLoading"
        >
          Limpiar
        </v-btn>
        <v-btn
          color="primary"
          @click="handleSave"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Guardar Reseña
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.editor-container {
  width: 100%;
  max-width: 1200px;
  height: auto;
}

.v-container.fluid {
  padding: 16px;
}
</style>