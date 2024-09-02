export type {
  GetApiFunctionParams,
  PostApiFunctionParams,
  CreateApiFunctionParams,
  UpdateApiFunctionParams,
  DeleteApiFunctionParams,
  IdApiExtras,
};

interface IdApiExtras {
  id: string | number;
}

interface GetApiFunctionParams<E = undefined> {
  id?: string | number;
  params: Record<string, any>;
  extras: E;
}

interface PostApiFunctionParams<D, E = undefined> {
  id?: string | number;
  data: D;
  extras: E;
}

interface CreateApiFunctionParams<D, E = undefined> {
  data: D;
  extras: E;
}

interface UpdateApiFunctionParams<D, E = undefined> {
  id: string | number;
  data: D;
  extras: E;
}

interface DeleteApiFunctionParams<E = undefined> {
  id: string | number;
  extras: E;
}
