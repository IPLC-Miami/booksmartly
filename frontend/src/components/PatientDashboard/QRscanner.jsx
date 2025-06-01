// // // // import React, { useState } from "react";
// // // // import QrScanner from "react-qr-scanner";
// // // // import { toast } from "sonner";

// // // // const API_URL = import.meta.env.VITE_API_BASE_URL;

// // // // function QRScanner({ appointmentId, onScanSuccess }) {
// // // //   const [scanResult, setScanResult] = useState(null);
// // // //   const [error, setError] = useState(null);

// // // //   const handleScan = (data) => {
// // // //     if (data) {
// // // //       // Depending on the library version, the scanned result may be an object.
// // // //       // For example, data might be like { text: "your-qr-content", ... }
// // // //       // Adjust accordingly if data is just a string.
// // // //       console.log("hry", appointmentId);
// // // //       const qrContent = typeof data === "object" ? data.text : data;
// // // //       setScanResult(qrContent);
// // // //       console.log("qr_code", qrContent);
// // // //       console.log("appointment_id", appointmentId);

// // // //       //   Send to backend for validation:
// // // //       fetch(`${API_URL}/api/users/validateQR/`, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify({
// // // //           qr_code: qrContent,
// // // //           appointmentId: appointmentId,
// // // //         }),
// // // //       })
// // // //         .then((res) => {
// // // //           if (!res.ok) {
// // // //             return res.json().then((errorData) => {
// // // //               // Throw an error to be caught in catch block.
// // // //               throw new Error(errorData.error || "Request failed");
// // // //             });
// // // //           }
// // // //           return res.json();
// // // //         })
// // // //         .then((responseData) => {
// // // //           console.log("Backend response:", responseData);
// // // //           onScanSuccess(responseData);
// // // //           toast.success("Check In Successfuls");
// // // //         })
// // // //         .catch((err) => {
// // // //           console.error("Error validating QR code:", err);
// // // //           setError("Failed to validate QR code");
// // // //           onScanSuccess("fail");
// // // //           toast.error("Some error occured possibly wrong QR Code Scanned");
// // // //         });
// // // //     }
// // // //   };

// // // //   const handleError = (err) => {
// // // //     console.error(err);
// // // //     setError("QR Scanner error: " + err);
// // // //   };

// // // //   const previewStyle = {
// // // //     height: 240,
// // // //     width: 320,
// // // //     margin: "0 auto",
// // // //   };

// // // //   return (
// // // //     <div style={{ textAlign: "center", marginTop: "2rem" }}>
// // // //       <h2>Scan QR Code</h2>
// // // //       <QrScanner
// // // //         delay={300}
// // // //         style={previewStyle}
// // // //         onError={handleError}
// // // //         onScan={handleScan}
// // // //       />
// // // //       {scanResult && (
// // // //         <p>
// // // //           <strong>Scanned QR Code:</strong> {scanResult}
// // // //         </p>
// // // //       )}
// // // //       {error && (
// // // //         <p style={{ color: "red" }}>
// // // //           <strong>Error:</strong> {error}
// // // //         </p>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // export default QRScanner;
// // import React, { useState, useRef } from "react";
// // import QrScanner from "react-qr-scanner";
// // import { toast } from "sonner";
// // import { MdCameraFront, MdCameraRear } from "react-icons/md";
// // import { Badge, Button, Code, DataList } from "@radix-ui/themes";

// // const API_URL = import.meta.env.VITE_API_BASE_URL;

// // function QRScanner({ appointmentId, onScanSuccess }) {
// //   const [scanResult, setScanResult] = useState(null);
// //   const [error, setError] = useState(null);
// //   const [facingMode, setFacingMode] = useState("environment"); // default to back camera
// //   const doneRef = useRef(false); // ← ref instead of state
// //   const lastScannedRef = useRef(null);

// //   const handleScan = (data) => {
// //     if (doneRef.current) return; // ← sync guard

// //     if (data) {
// //       doneRef.current = true; // ← flip immediately

// //       const qrContent = typeof data === "object" ? data.text : data;
// //       if (lastScannedRef.current === qrContent) return; // guard #2

// //       setScanResult(qrContent);
// //       lastScannedRef.current = qrContent;

// //       console.log("qr_code", qrContent);
// //       console.log("appointment_id", appointmentId);

// //       // Send to backend for validation:
// //       fetch(`${API_URL}/api/users/validateQR/`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           qr_code: qrContent,
// //           appointmentId: appointmentId,
// //         }),
// //       })
// //         .then((res) => {
// //           if (!res.ok) {
// //             return res.json().then((errorData) => {
// //               throw new Error(errorData.error || "Request failed");
// //             });
// //           }
// //           return res.json();
// //         })
// //         .then((responseData) => {
// //           console.log("Backend response:", responseData);
// //           onScanSuccess(responseData);
// //           toast.success("Check In Successful");
// //         })
// //         .catch((err) => {
// //           console.error("Error validating QR code:", err);
// //           setError("Failed to validate QR code");
// //           onScanSuccess("fail");
// //           toast.error(
// //             "Some error occurred, possibly a wrong QR Code was scanned",
// //           );
// //         });
// //     }
// //   };

// //   const handleError = (err) => {
// //     console.error(err);
// //     setError("QR Scanner error: " + err);
// //   };

// //   const previewStyle = {
// //     height: 240,
// //     width: 320,
// //     margin: "0 auto",
// //   };

// //   // Toggle between "environment" (back camera) and "user" (front camera)
// //   const switchCamera = () => {
// //     setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
// //   };

// //   const cameraIcon =
// //     facingMode === "environment" ? (
// //       <MdCameraRear size={24} />
// //     ) : (
// //       <MdCameraFront size={24} />
// //     );

// //   return (
// //     <div style={{ textAlign: "center", marginTop: "2rem" }}>
// //       <h2>Scan QR Code</h2>
// //       {!doneRef.current && (
// //         <QrScanner
// //           delay={300}
// //           style={previewStyle}
// //           onError={handleError}
// //           onScan={handleScan}
// //           // Pass the constraints to set the camera facing mode.
// //           constraints={{ video: { facingMode } }}
// //         />
// //       )}
// //       <div className="mt-2">
// //         <Button onClick={switchCamera}>{cameraIcon}</Button>
// //         {error && (
// //           <p style={{ color: "red", margin: 0 }}>
// //             <strong>Error:</strong> {error}
// //           </p>
// //         )}
// //       </div>

// //       {/* {scanResult && (
// //         <p>
// //           <strong>Scanned QR Code:</strong> {scanResult}
// //         </p>
// //       )} */}
// //     </div>
// //   );
// // }

// // export default QRScanner;
// import React, {
//   useState,
//   useRef,
//   useImperativeHandle,
//   forwardRef,
// } from "react";
// import QrScanner from "react-qr-scanner";
// import { toast } from "sonner";
// import { MdCameraFront, MdCameraRear } from "react-icons/md";
// import { Badge, Button, Code, DataList } from "@radix-ui/themes";

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const QRScanner = forwardRef(({ appointmentId, onScanSuccess }, ref) => {
//   const [scanResult, setScanResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [facingMode, setFacingMode] = useState("environment"); // default to back camera
//   const [isProcessing, setIsProcessing] = useState(false); // Add this state
//   const doneRef = useRef(false);
//   const lastScannedRef = useRef(null);

//   // Expose reset function to parent component
//   useImperativeHandle(ref, () => ({
//     resetScanner: () => {
//       doneRef.current = false;
//       lastScannedRef.current = null;
//       setIsProcessing(false);
//       setScanResult(null);
//       setError(null);
//     },
//   }));

//   const handleScan = (data) => {
//     // Don't process if already done or currently processing
//     if (doneRef.current || isProcessing) return;

//     if (data) {
//       const qrContent = typeof data === "object" ? data.text : data;

//       // Prevent duplicate scans
//       if (lastScannedRef.current === qrContent) return;

//       // Mark as processing to prevent additional scans
//       setIsProcessing(true);
//       lastScannedRef.current = qrContent;
//       setScanResult(qrContent);

//       console.log("qr_code", qrContent);
//       console.log("appointment_id", appointmentId);

//       // Send to backend for validation:
//       fetch(`${API_URL}/api/users/validateQR/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           qr_code: qrContent,
//           appointmentId: appointmentId,
//         }),
//       })
//         .then((res) => {
//           if (!res.ok) {
//             return res.json().then((errorData) => {
//               throw new Error(errorData.error || "Request failed");
//             });
//           }
//           return res.json();
//         })
//         .then((responseData) => {
//           console.log("Backend response:", responseData);
//           doneRef.current = true; // Only mark as done on successful validation
//           onScanSuccess(responseData);
//           toast.success("Check In Successful");
//         })
//         .catch((err) => {
//           console.error("Error validating QR code:", err);
//           setError("Failed to validate QR code: " + err.message);
//           toast.error(
//             "Some error occurred, possibly a wrong QR Code was scanned",
//           );
//           // Important: Reset processing state so user can try again
//           setIsProcessing(false);
//           // Don't call onScanSuccess on failure
//         });
//     }
//   };

//   const handleError = (err) => {
//     console.error(err);
//     setError("QR Scanner error: " + err);
//     setIsProcessing(false);
//   };

//   const previewStyle = {
//     height: 240,
//     width: 320,
//     margin: "0 auto",
//   };

//   // Toggle between "environment" (back camera) and "user" (front camera)
//   const switchCamera = () => {
//     setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
//   };

//   const cameraIcon =
//     facingMode === "environment" ? (
//       <MdCameraFront size={24} />
//     ) : (
//       <MdCameraRear size={24} />
//     );

//   return (
//     <div className="qr-scanner-container">
//       <h3>Scan QR Code</h3>
//       {!doneRef.current && (
//         <QrScanner
//           delay={300}
//           onError={handleError}
//           onScan={handleScan}
//           style={previewStyle}
//           constraints={{
//             video: { facingMode: facingMode },
//           }}
//         />
//       )}
//       <div className="scanner-controls">
//         <Button
//           onClick={switchCamera}
//           disabled={isProcessing || doneRef.current}
//         >
//           {cameraIcon}
//         </Button>
//         {error && (
//           <Badge color="red" size="2">
//             <strong>Error:</strong> {error}
//           </Badge>
//         )}
//       </div>
//       {scanResult && doneRef.current && (
//         <DataList>
//           <DataList.Item label="Scan Status">
//             <Code color="green">Successful</Code>
//           </DataList.Item>
//         </DataList>
//       )}
//     </div>
//   );
// });

// export default QRScanner;
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import QrScanner from "react-qr-scanner";
import { toast } from "sonner";
import { MdCameraFront, MdCameraRear } from "react-icons/md";
import { Badge, Button, Code, DataList } from "@radix-ui/themes";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const QRScanner = forwardRef(({ appointmentId, onScanSuccess }, ref) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // default to back camera
  const [isProcessing, setIsProcessing] = useState(false);
  const doneRef = useRef(false);
  const lastScannedRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

  // Expose reset function to parent component
  useImperativeHandle(ref, () => ({
    resetScanner: () => {
      doneRef.current = false;
      lastScannedRef.current = null;
      setIsProcessing(false);
      setScanResult(null);
      setError(null);
    },
  }));

  const handleScan = (data) => {
    setTimeout(() => {}, 1000);
    // Don't process if already done or currently processing
    if (doneRef.current || isProcessing) return;

    if (data) {
      const qrContent = typeof data === "object" ? data.text : data;
      // Prevent duplicate scans
      if (lastScannedRef.current === qrContent) return;

      // Mark as processing to prevent additional scans
      setIsProcessing(true);
      lastScannedRef.current = qrContent;
      setScanResult(qrContent);

      console.log("qr_code", qrContent);
      console.log("appointment_id", appointmentId);

      // Send to backend for validation:
      fetch(`${API_URL}/api/users/validateQR/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_code: qrContent,
          appointmentId: appointmentId,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(errorData.error || "Request failed");
            });
          }
          return res.json();
        })
        .then((responseData) => {
          console.log("Backend response:", responseData);
          doneRef.current = true; // Only mark as done on successful validation
          onScanSuccess(responseData);
          toast.success("Check In Successful");
          // refresh the page
          // window.location.reload();
        })
        .catch((err) => {
          console.error("Error validating QR code:", err);
          setError("Failed to validate QR code: " + err.message);
          toast.error(
            "Some error occurred, possibly a wrong QR Code was scanned",
          );
          // Reset processing state so user can try again
          setIsProcessing(false);
        });
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError("QR Scanner error: " + err);
    setIsProcessing(false);
  };

  const previewStyle = {
    height: 240,
    width: 320,
    margin: "0 auto",
  };

  // Toggle between "environment" (back camera) and "user" (front camera)
  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const cameraIcon =
    facingMode === "environment" ? (
      <MdCameraFront size={24} />
    ) : (
      <MdCameraRear size={24} />
    );

  return (
    <div
      className="qr-scanner-container"
      style={{ textAlign: "center", marginTop: "2rem" }}
    >
      <h3>Scan QR Code</h3>
      {!doneRef.current && (
        <QrScanner
          delay={1000}
          onError={handleError}
          onScan={handleScan}
          style={previewStyle}
          constraints={{ video: { facingMode: facingMode, frameRate: 100 } }}
          tracker={false}
          enabled={enabled}
        />
      )}
      <div className="scanner-controls mt-2 flex flex-col items-center justify-center gap-y-2">
        <Button
          onClick={switchCamera}
          disabled={isProcessing || doneRef.current}
        >
          {cameraIcon}
        </Button>
        {error && (
          <Badge color="red" size="2">
            <strong>Error:</strong> {error}
          </Badge>
        )}
      </div>
      {scanResult && doneRef.current && (
        <DataList>
          <DataList.Item label="Scan Status">
            <Code color="green">Successful</Code>
          </DataList.Item>
        </DataList>
      )}
    </div>
  );
});

export default QRScanner;

