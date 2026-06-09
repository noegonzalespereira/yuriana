import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {

  async subirArchivo(
    archivo: any,
    carpeta: string,
  ): Promise<{ url: string; tipo_archivo: string }> {
    if (!archivo || !archivo.buffer) {
      throw new BadRequestException('El archivo no tiene un formato válido o está vacío');
    }
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(archivo.mimetype)) {
      throw new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP) o PDF');
    }
    const tipo_archivo = archivo.mimetype === 'application/pdf' ? 'pdf' : 'imagen';
    const url = await this.subirStream(archivo.buffer, carpeta, archivo.mimetype);
    return { url, tipo_archivo };
  }

  private subirStream(buffer: Buffer, carpeta: string, mimetype: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const esPDF = mimetype === 'application/pdf';
      const opciones = {
        folder: carpeta,
        resource_type: (esPDF ? 'image' : 'image') as 'image',
        format: esPDF ? 'pdf' : undefined,
        access_control: [{ access_type: 'anonymous' }],
      };
      const uploadStream = cloudinary.uploader.upload_stream(opciones, (error, result) => {
        if (error) {
          const msg = (error.message || '').toLowerCase();
          const httpCode = (error as any).http_code;
          if (
            httpCode === 413 ||
            msg.includes('file size') ||
            msg.includes('too large') ||
            msg.includes('maximum') ||
            msg.includes('exceeds')
          ) {
            return reject(
              new BadRequestException(
                'El archivo es demasiado grande para subir. Reduce el tamaño del documento e inténtalo de nuevo.',
              ),
            );
          }
          return reject(error);
        }
        resolve(result!.secure_url);
      });
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async eliminarArchivo(url: string): Promise<void> {
    try {
      if (!url) return;
      const coincidencias = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
      if (!coincidencias) return;
      const publicId = coincidencias[1];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (error) {
      console.error('Error al eliminar en Cloudinary:', error);
    }
  }

  
generarUrlAcceso(url: string): string {
  console.log(`[CloudinaryService] URL solicitada: ${url}`);
  // Con PDF delivery habilitado, TODAS las URLs son públicas
  // Solo necesitas fl_attachment=false para que abra inline
  
  // Agrega fl_inline para mostrar en visor en lugar de descargar
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/');
  }
  
  return url;
}
}