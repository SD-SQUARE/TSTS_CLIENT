import type { UserFormData } from "../../Types/users";

export interface UserFormStepHandle {
  getValues: () => Partial<UserFormData>;
}
