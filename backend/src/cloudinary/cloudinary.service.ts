import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
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

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!tiposPermitidos.includes(archivo.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes (JPG, PNG, WEBP) o PDF',
      );
    }

    const tipo_archivo = archivo.mimetype === 'application/pdf'
      ? 'pdf'
      : 'imagen';

    const url = await this.subirStream(archivo.buffer, carpeta);

    return { url, tipo_archivo };
  }

  private subirStream(
  buffer: Buffer,
  carpeta: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const opciones = {
      folder: carpeta,
      resource_type: 'auto' as const,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      opciones,
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

  async eliminarArchivo(url: string): Promise<void> {
    try {
      const partes = url.split('/');
      const nombreArchivoConExtension = partes[partes.length - 1];
      const publicIdSinExtension = nombreArchivoConExtension.split('.')[0];
      const carpeta = partes[partes.length - 2];
      const publicId = `${carpeta}/${publicIdSinExtension}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error al eliminar en Cloudinary:', error);
    }
  }
}