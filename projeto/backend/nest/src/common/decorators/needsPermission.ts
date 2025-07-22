import { SetMetadata } from "@nestjs/common";
import { Permission } from "../enums/permissao.enum";

export const NeedsPermission = (level: Permission) => SetMetadata('needsPermission', level); //deve ser usado nos controllers
