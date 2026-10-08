import type { InterfacePalette } from "../palette";
import { user } from "./fixtures";
import { state, copy } from "./store";
export { csrfToken } from "../auth";
export const getCurrentUser = async () =>
  copy({ ...user, interface_palette: state.palette });
export const login = async () => {
  throw new Error("La démo ne demande aucun compte.");
};
export const logout = async () => {};
export const savePalette = async (palette: InterfacePalette) => {
  state.palette = palette;
  return getCurrentUser();
};
