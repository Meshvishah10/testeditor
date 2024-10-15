export interface NewsResponse {
  NewsList: News[];
  Total: number;
}

export interface News {
  Id: number;
  Link: string;
  PublishDate: string;
  Title: string;
  Status: number;
  StatusText: string;
}