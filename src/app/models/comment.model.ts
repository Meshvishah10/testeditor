export interface Comment {
  Id: string;
  Comment: string;
  Createddate: string;
  CreatedByName: string;
}

export interface CommentRes {
  Comments: Comment[];
  PhysicianName: string;
  ConfirmationCode: number;
}
