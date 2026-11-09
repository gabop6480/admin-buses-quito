import { guardar, eliminar } from '@/controllers/crud';

export const PUT = (req, { params }) => guardar(params.recurso, req, params.id);
export const DELETE = (_req, { params }) => eliminar(params.recurso, params.id);
