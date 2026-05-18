import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    // Configuración del escáner: cuadros por segundo y tamaño de la caja de escaneo
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false // false = no usar interfaz antigua
    );

    // Función que se ejecuta cuando lee un QR exitosamente
    const handleScan = (decodedText) => {
      scanner.clear(); // Apaga la cámara automáticamente al leer
      onScanSuccess(decodedText); // Envía el código al componente padre
    };

    const handleError = (err) => {
      // Ignoramos los errores constantes mientras la cámara busca un QR
    };

    scanner.render(handleScan, handleError);

    // Limpieza al desmontar el componente (salir de la pantalla)
    return () => {
      scanner.clear().catch(error => console.error("Error limpiando escáner", error));
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div id="qr-reader" className="w-full"></div>
    </div>
  );
};

export default QRScanner;