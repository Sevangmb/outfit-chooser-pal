export const useCameraCapture = (onCapture: (imageData: string) => void) => {
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      });

      const capture = () => {
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        onCapture(imageData);
        stream.getTracks().forEach(track => track.stop());
      };

      video.addEventListener("click", capture);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  return { handleCameraCapture };
};