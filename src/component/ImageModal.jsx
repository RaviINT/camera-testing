import React, { useEffect, useRef, useState } from "react";

function ImageCaptureModal() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [value, setValue] = useState(0);
  const [hasCameraAccess, setHasCameraAccess] = useState(true);
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");

  const handleTabChange = (_e, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCamereAccess = () => {
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setHasCameraAccess(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraAccess(false);
      }
    };
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      checkCameraAccess();
    } else {
      console.error("getUserMedia not supported on your browser");
      setHasCameraAccess(false);
    }
  };

  useEffect(() => {
    handleCamereAccess();
    async function openCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: isMobile ? "environment" : "user" },
        });
        videoRef.current.srcObject = stream;
        streamRef.current = stream; // Store the stream reference
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    }
    openCamera();

    // Clean up function to stop the stream when the component unmounts or modal is closed
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [value]);

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null; // Reset the stream reference
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    // Calculate the dimensions and coordinates to center the capture
    const newWidth = 494;
    const newHeight = 294;
    const centerX = videoWidth / 2 - newWidth / 2;
    const centerY = videoHeight / 2 - newHeight / 2;

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.getContext("2d").drawImage(videoRef.current, centerX, centerY, newWidth, newHeight, 0, 0, newWidth, newHeight);

    const capturedPhoto = canvas.toDataURL("image/jpeg");
    // console.log(canvas.width, canvas.height, capturedPhoto);
    // Convert base64 to Blob
    // console.log(capturedPhoto);
    const byteString = atob(capturedPhoto.split(",")[1]);
    const mimeString = capturedPhoto.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });

    // Create a file from the blob
    const file = new File([blob], "capturedPhoto.jpeg", { type: mimeString });
    setImage1(capturedPhoto);
    setImage2(file);
    // handleChange(multi ? capturedPhoto : file);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline width="300px" height="200px" />
      <button onClick={capturePhoto}>Capture</button>
      <img src={image1} alt="" />
      hiii
      {image2 && <img src={URL.createObjectURL(image2)} alt="" />}
    </div>
  );
}

export default ImageCaptureModal;
