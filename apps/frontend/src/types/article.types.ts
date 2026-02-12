export interface Article {
    id: string;
    title: string;
    content: string;
    authorId: string;
    status: ArticleStatus;
    createdAt: Date;
    updatedAt: Date;
}

export enum ArticleStatus {
    PENDING = 'pending',
    VALIDATED = 'validated',
    REJECTED = 'rejected'
}