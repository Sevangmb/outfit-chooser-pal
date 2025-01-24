import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface OutfitCanvasProps {
  selectedTop: number | null;
  selectedBottom: number | null;
  selectedShoes: number | null;
  clothes: any[];
}

export const OutfitCanvas = ({ selectedTop, selectedBottom, selectedShoes, clothes }: OutfitCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 600,
      backgroundColor: "#f8f9fa",
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const addClothingItem = async (clothingId: number | null, position: { top: number }) => {
      if (!clothingId) return;

      const clothing = clothes.find(item => item.id === clothingId);
      if (!clothing?.image) return;

      try {
        canvas.clear();
        
        const img = await FabricImage.fromURL(clothing.image);
        if (!img) return;

        const scale = Math.min(200 / img.width!, 200 / img.height!);
        img.scale(scale);
        img.set({
          left: 100,
          top: position.top,
          cornerStyle: 'circle',
          cornerColor: '#0EA5E9',
          cornerStrokeColor: '#fff',
          cornerSize: 12,
          transparentCorners: false,
        });

        canvas.add(img);
        canvas.renderAll();
      } catch (error) {
        console.error("Error adding clothing item:", error);
      }
    };

    // Position les vêtements à différentes hauteurs
    addClothingItem(selectedTop, { top: 50 });
    addClothingItem(selectedBottom, { top: 250 });
    addClothingItem(selectedShoes, { top: 450 });
  }, [canvas, selectedTop, selectedBottom, selectedShoes, clothes]);

  const handleZoomIn = () => {
    if (!canvas) return;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 1.1);
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom / 1.1);
  };

  const handleRotateAll = () => {
    if (!canvas) return;
    canvas.getObjects().forEach(obj => {
      obj.rotate((obj.angle || 0) + 15);
    });
    canvas.renderAll();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleRotateAll}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};