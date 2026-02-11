import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ArticleStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    VALIDATED = 'VALIDATED',
    REJECTED = 'REJECTED',
}

@Entity()
export class Article {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('decimal')
    price: number;

    @Column()
    category: string;

    @Column({
        type: 'enum',
        enum: ArticleStatus,
        default: ArticleStatus.PENDING,
    })
    status: ArticleStatus;

    @Column({ default: false })
    isFlagged: boolean;

    @Column()
    sellerId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
