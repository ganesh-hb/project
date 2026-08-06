import { Controller } from "@nestjs/common";
import { BrandService } from "./brand.service";

@Controller('brand')
export class BrandContorller{
    constructor(private readonly brandService:BrandService){}


}