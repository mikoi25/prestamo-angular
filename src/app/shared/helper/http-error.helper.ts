
import { HttpErrorResponse } from '@angular/common/http';

export class HttpErrorHelper {

  static getMessage(
    error: HttpErrorResponse
  ): string {

    switch (error.status) {

      case 0:
        return 'Sin conexión al servidor.';

      case 400:
        return 'Solicitud inválida.';

      case 401:
        return 'Debes iniciar sesión nuevamente.';

      case 403:
        return 'Acceso denegado.';

      case 404:
        return 'Recurso no encontrado.';

      case 422:
        return 'Errores de validación.';

      case 500:
        return 'Error interno del servidor.';

      default:
        return 'Error inesperado.';
    }
  }
}