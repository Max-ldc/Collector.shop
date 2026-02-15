export interface Article {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    sellerId: string;
    status: ArticleStatus;
    createdAt: Date;
    updatedAt: Date;
}

export enum ArticleStatus {
    PENDING = 'pending',
    VALIDATED = 'validated',
    REJECTED = 'rejected'
}