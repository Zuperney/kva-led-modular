import { TECH_LIMITS } from "../core/constants.js";
import { createProjectV1 } from "../core/project-schema.js";
import { defaultCabinetRecord, toScreenCabinet } from "./cabinets/model.js";

export function createDefaultProject() {
  return createProjectV1({
    config: {
      tensao: 380,
      fase: 3,
      margem: 15,
      reservaCircuito: 25,
      pixelsPerPort: TECH_LIMITS.PIXELS_PER_PORT,
      overclock: false,
    },
    screens: [createDefaultScreen("Tela 1")],
  });
}

export function createDefaultScreen(nome, cabinet = null) {
  return {
    id: "screen-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    nome,
    quantidade_colunas: 4,
    quantidade_linhas: 3,
    gabinete: toScreenCabinet(cabinet || defaultCabinetRecord()),
  };
}
