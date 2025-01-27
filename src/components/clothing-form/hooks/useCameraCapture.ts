export const useCameraCapture = (onCapture: (imageData: string) => void) => {
  const handleCameraCapture = async () => {
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment" // Prefer rear camera on mobile
        } 
      });
      
      console.log("Camera access granted");
      const video = document.querySelector("#camera-preview") as HTMLVideoElement;
      
      if (!video) {
        console.error("Camera preview element not found");
        throw new Error("Élément de prévisualisation de la caméra non trouvé");
      }

      video.srcObject = stream;
      await video.play();
      console.log("Video stream started");

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        console.error("Failed to get canvas context");
        throw new Error("Impossible d'initialiser le contexte de capture");
      }

      const capture = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        console.log("Image captured successfully");
        
        // Stop all tracks
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log("Camera track stopped");
          });
        }

        // Clear video source
        video.srcObject = null;
        
        onCapture(imageData);
      };

      // Add click event listener for manual capture
      video.addEventListener("click", capture);
      
      // Automatically capture after a delay
      setTimeout(capture, 1000);

    } catch (error) {
      console.error("Camera access error:", error);
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            throw new Error("L'accès à la caméra a été refusé. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.");
          case "NotFoundError":
            throw new Error("Aucune caméra n'a été trouvée sur votre appareil.");
          case "NotReadableError":
            throw new Error("La caméra est déjà utilisée par une autre application.");
          case "SecurityError":
            throw new Error("L'accès à la caméra n'est pas autorisé dans ce contexte. Veuillez vérifier les paramètres de sécurité.");
          default:
            throw new Error(`Erreur d'accès à la caméra: ${error.name}`);
        }
      }
      
      throw new Error("Une erreur est survenue lors de l'accès à la caméra.");
    }
  };

  return { handleCameraCapture };
};