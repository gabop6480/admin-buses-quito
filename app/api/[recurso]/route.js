import { listar, guardar } from '@/controllers/crud';

export const GET = (req, { params }) => listar(params.recurso, req);
export const POST = (req, { params }) => guardar(params.recurso, req, null);
