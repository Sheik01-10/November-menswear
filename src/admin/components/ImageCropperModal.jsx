import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Move } from "lucide-react";

export default function ImageCropperModal({ isOpen, onClose, imageSrc, filename, onCrop }) {
  if (!isOpen) return null;

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Constants for container dimensions
  const containerW = 360;
  const containerH = 450;

  // Reset states when a new image is loaded
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setInitialSize({ width: 0, height: 0 });
  }, [imageSrc]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    
    // Fit image to cover the 4:5 container
    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = containerW / containerH; // 0.8

    let initialW, initialH;
    if (imageAspect > containerAspect) {
      // Image is wider: fit height and scale width
      initialH = containerH;
      initialW = containerH * imageAspect;
    } else {
      // Image is taller: fit width and scale height
      initialW = containerW;
      initialH = containerW / imageAspect;
    }

    setInitialSize({ width: initialW, height: initialH });

    // Center image inside the container
    const initX = (containerW - initialW) / 2;
    const initY = (containerH - initialH) / 2;
    setPosition({ x: initX, y: initY });
  };

  const handleStart = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    const currentW = initialSize.width * zoom;
    const currentH = initialSize.height * zoom;

    const minX = containerW - currentW;
    const maxX = 0;
    const minY = containerH - currentH;
    const maxY = 0;

    const newX = Math.min(Math.max(dx, minX), maxX);
    const newY = Math.min(Math.max(dy, minY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);

    const currentW = initialSize.width * newZoom;
    const currentH = initialSize.height * newZoom;

    const minX = containerW - currentW;
    const maxX = 0;
    const minY = containerH - currentH;
    const maxY = 0;

    // Adjust position to stay within constraints after zoom change
    setPosition((prev) => ({
      x: Math.min(Math.max(prev.x, minX), maxX),
      y: Math.min(Math.max(prev.y, minY), maxY),
    }));
  };

  const handleCrop = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");

    // Enable high quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const R = 1080 / containerW; // scale factor (3x)
    const currentW = initialSize.width * zoom;
    const currentH = initialSize.height * zoom;

    ctx.drawImage(
      imgRef.current,
      position.x * R,
      position.y * R,
      currentW * R,
      currentH * R
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], filename || "product.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCrop(croppedFile);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  return (
    <div className="cropper-modal-overlay" onClick={onClose}>
      <div className="cropper-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cropper-modal-header">
          <div>
            <h3>Crop Product Image</h3>
            <p>Drag and zoom to fit the 4:5 aspect ratio (1080 × 1350 px)</p>
          </div>
          <button className="cropper-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cropper-workarea">
          <div
            ref={containerRef}
            className="cropper-container"
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="To Crop"
                onLoad={handleImageLoad}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: `${initialSize.width}px`,
                  height: `${initialSize.height}px`,
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: "top left",
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                  pointerEvents: "auto",
                }}
              />
            )}
            <div className="cropper-overlay-mask">
              <div className="cropper-center-indicator">
                <Move size={24} className="drag-indicator-icon" />
                <span>Drag to reposition</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cropper-controls">
          <div className="zoom-slider-wrap">
            <ZoomOut size={16} />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
              className="cropper-zoom-range"
            />
            <ZoomIn size={16} />
            <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="cropper-actions">
            <button type="button" className="btn-cropper-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-cropper-save" onClick={handleCrop}>
              Crop & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
