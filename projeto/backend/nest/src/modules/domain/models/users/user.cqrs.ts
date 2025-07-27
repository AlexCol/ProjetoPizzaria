import { CreateUserHandler } from "./services/commands/handles/create-user.handler";
import { UpdateUserHandler } from "./services/commands/handles/update-user.handler";
import { UserCreatedHandler } from "./services/events/handles/user-created.handler";
import { GetUserByEmailHandler } from "./services/queries/handles/get-user-by-email.handler";
import { GetUserByIdHandler } from "./services/queries/handles/get-user-by-id.handler";
import { GetUsersHandler } from "./services/queries/handles/get-users.handler";

const CommandHandlers = [CreateUserHandler, UpdateUserHandler]; // Adicione outros command handlers aqui quando criar
const QueryHandlers = [GetUsersHandler, GetUserByEmailHandler, GetUserByIdHandler]; // Adicione query handlers aqui quando criar
const EventHandlers = [UserCreatedHandler];

const userCqrs = {
  CommandHandlers,
  QueryHandlers,
  EventHandlers,
};
export default userCqrs;