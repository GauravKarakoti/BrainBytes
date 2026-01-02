export type GetListParams = {
  pagination: {
    page: number;
    perPage: number;
  };
  sort: {
    field: string;
    order: "ASC" | "DESC";
  };
  filter: any;
};