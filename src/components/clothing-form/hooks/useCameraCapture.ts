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
      const video = document.createElement("video");
      video.srcObject = stream;
      
      // Return early if video element creation fails
      if (!video) {
        console.error("Failed to create video element");
        throw new Error("Failed to create video element");
      }

      await video.play();
      console.log("Video stream started");

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        console.error("Failed to get canvas context");
        throw new Error("Failed to get canvas context");
      }

      video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log("Canvas dimensions set:", canvas.width, "x", canvas.height);
      });

      const capture = () => {
        if (!context) return;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        console.log("Image captured successfully");
        
        // Clean up
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Camera track stopped");
        });
        
        onCapture(imageData);
      };

      // Add click event listener to capture
      video.addEventListener("click", capture);
      
      // Automatically capture after a short delay
      setTimeout(capture, 1000);

    } catch (error) {
      console.error("Camera access error:", error);
      
      // Check for specific permission errors
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            throw new Error("L'accès à la caméra a été refusé. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.");
          case "NotFoundError":
            throw new Error("Aucune caméra n'a été trouvée sur votre appareil.");
          case "NotReadableError":
            throw new Error("La caméra est déjà utilisée par une autre application.");
          default:
            throw new Error(`Erreur d'accès à la caméra: ${error.name}`);
        }
      }
      
      throw new Error("Une erreur est survenue lors de l'accès à la caméra.");
    }
  };

  return { handleCameraCapture };
};