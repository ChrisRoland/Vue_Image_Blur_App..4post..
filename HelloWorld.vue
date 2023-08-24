<template>
    <div>
        <input type="file" accept="image/*" @change="handleImageUpload">
        <div v-if="blurredImage">
            <img :src="blurredImage" alt="Blurred Image">
        </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
        return {
            imageBlurWorker: null,
            blurredImage: null
        };
    },
    created() {
        this.imageBlurWorker = new Worker('imageBlurWorker.js');
        this.imageBlurWorker.onmessage = (e) => {
            const blurredImageData = e.data;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = blurredImageData.width;
            canvas.height = blurredImageData.height;
            ctx.putImageData(new ImageData(blurredImageData.data, blurredImageData.width, blurredImageData.height), 0, 0);
            const blurredImageURL = canvas.toDataURL();
            this.blurredImage = blurredImageURL;
        };
    },
    methods: {
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const arrayBuffer = e.target.result;
                    const blob = new Blob([arrayBuffer], { type: file.type });
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, img.width, img.height);
                        this.imageBlurWorker.postMessage(imageData);
                    };
                    img.src = URL.createObjectURL(blob);
                };
                reader.readAsArrayBuffer(file);
            }
        }
    },
    beforeUnmount() {
        this.imageBlurWorker.terminate();
    }
  };
  </script>
  