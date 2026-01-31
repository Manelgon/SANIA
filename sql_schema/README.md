# SanIA Modular SQL Schema

Este directorio contiene la estructura de la base de datos dividida en módulos independientes para facilitar la creación desde cero y el mantenimiento.

## Orden de Ejecución Recomendado

Para garantizar que todas las dependencias (Foreign Keys, Funciones Auxiliares) se resuelvan correctamente, ejecute los archivos en el siguiente orden:

1.  **`01_auth_helpers.sql`**: Extensiones base y funciones de administración (`is_admin`).
2.  **`02_profiles.sql`**: Tabla de perfiles, lógica de FID y seguridad de roles.
3.  **`03_carteras.sql`**: Gestión de carteras, accesos e invitaciones.
4.  **`04_pacientes.sql`**: Ficha de paciente, lógica de activación y helpers de acceso.
5.  **`05_clinical_base.sql`**: Catálogos (CIE-10, Patologías) y helpers clínicos.
6.  **`06_consultations.sql`**: Consultas, recetas, pruebas y diagnósticos codificados.
7.  **`07_patient_records.sql`**: Antecedentes médicos, alergias y gestión de documentos.
8.  **`08_agendas_citas.sql`**: Sistema de agendas y citas con control de solapamiento.
9.  **`09_communication.sql`**: Notificaciones, mensajes internos y plantillas.
10. **`10_audit_system.sql`**: Sistema de auditoría RGPD/LOPDGDD (Audit Logs).
11. **`11_storage_policies.sql`**: Configuración de buckets y políticas de acceso a archivos.
12. **`12_grants_and_maintenance.sql`**: Permisos finales (Grants) y funciones de limpieza.

## Notas Técnicas

- **Consistencia**: Se han unificado los nombres de columnas (ej: `paciente_id` siempre, `activo` para estados).
- **Seguridad**: Todas las tablas tienen RLS habilitado y políticas estrictas.
- **Auditoría**: Los triggers de auditoría están integrados en las tablas críticas.
- **Resiliencia**: Los scripts usan `CREATE TABLE IF NOT EXISTS` para permitir re-ejecuciones seguras.
