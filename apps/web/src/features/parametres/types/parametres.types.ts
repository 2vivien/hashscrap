export interface Parametres {
  collecteur: {
    requests_per_second: number;
    depth: number;
    max_pages: number;
    timeout: number;
  };
  reseau: {
    proxy: string;
    user_agent_rotation: boolean;
    robots_txt: boolean;
  };
  conservation: {
    preuves: "90" | "365" | "illimite";
    auto_suppression_logs: {
      active: boolean;
      jours: number;
    };
  };
  securite: {
    reset_warning: boolean;
  };
  audit: {
    logs: Array<{
      at: string;
      level: "INFO" | "DEBUG" | "WARN" | "ERROR";
      message: string;
    }>;
    derniere_maj: string;
    version: string;
    licence: string;
  };
}

export const CONSERVATION_LABELS = {
  preuves: {
    "90": "90 jours",
    "365": "1 an",
    "illimite": "Illimité",
  },
};
