// Types partagés dans toute l'application.

export interface Identite {
  prenom?: string;
  nom?: string;
  titre_courant?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  linkedin?: string;
  github?: string;
}

// Le profil est stocké en JSON libre (jsonb) pour rester flexible.
// On type surtout l'identité, le reste est un objet ouvert.
export interface Profil {
  identite?: Identite;
  formations?: any[];
  experiences?: any[];
  projets?: any[];
  competences?: Record<string, string[]>;
  langues?: { langue: string; niveau: string }[];
  interets?: string[];
  [key: string]: unknown;
}

export interface OffreAnalysee {
  poste: string;
  entreprise: string;
  secteur?: string;
  lieu?: string;
  type_contrat?: string;
  competences_requises?: string[];
  competences_souhaitees?: string[];
  mots_cles_ats?: string[];
  missions_principales?: string[];
  profil_recherche?: string;
  valeurs_entreprise?: string[];
  niveau_experience?: string;
}

export interface CvExperience {
  intitule: string;
  entreprise: string;
  lieu?: string;
  periode?: string;
  missions: string[];
}

export interface CvFormation {
  diplome: string;
  etablissement: string;
  lieu?: string;
  periode?: string;
  description?: string;
}

export interface CvProjet {
  titre: string;
  technologies?: string;
  description?: string;
}

export interface CvData {
  titre_cv: string;
  resume?: string;
  experiences: CvExperience[];
  formations: CvFormation[];
  projets?: CvProjet[];
  competences?: Record<string, string[]>;
  langues?: string[];
}

export type Statut = "brouillon" | "envoyee" | "entretien" | "refus" | "offre";

export interface Candidature {
  id: string;
  user_id: string;
  poste: string | null;
  entreprise: string | null;
  lieu: string | null;
  type_contrat: string | null;
  lien_offre: string | null;
  notes: string | null;
  langue: string | null;
  statut: Statut;
  offre_texte: string | null;
  offre_analysee: OffreAnalysee | null;
  cv_data: CvData | null;
  lettre: string | null;
  created_at: string;
  updated_at: string;
}
