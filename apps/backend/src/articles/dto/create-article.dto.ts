import { IsNotEmpty, IsString, MinLength, IsNumber, IsPositive } from 'class-validator';

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsString()
    @IsNotEmpty()
    category: string;
}
