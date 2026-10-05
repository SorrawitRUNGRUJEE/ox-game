import { IsInt, Max, Min } from 'class-validator';

export class MoveDto {
  @IsInt()
  @Min(0)
  @Max(8)
  cell: number;
}
