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
            console.error("Camera permission denied by user");
            break;
          case "NotFoundError":
            console.error("No camera device found");
            break;
          case "NotReadableError":
            console.error("Camera is already in use");
            break;
          default:
            console.error("Camera error:", error.name);
        }
      }
      
      // Re-throw the error to be handled by the component
      throw error;
    }
  };

  return { handleCameraCapture };
};