export interface InMatrix {
  type: string;
  id: string;
  spec_version: string;
  objects: Array<InJSONDataType>;
}
export type InJSONDataType = InMiterTactics | InMiterMatrix | InMiterTechnique | TechToSubTech;
export type InJSONDataTypes<T> = Array<T>;

export interface InMiterMatrix {
  object_marking_refs: string[];
  type: string;
  name: string;
  description: string;
  modified: string;
  id: string;
  created: string;
  tactic_refs: string[];
  created_by_ref: string;
  external_references: ExternalReference[];
  spec_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_domains: string[];
  x_mitre_modified_by_ref: string;
  x_mitre_version: string;
}

export interface TechToTactic {
  t_t_id: string;
  tactic_id: string;
  technique_id: string;
}

export interface InMiterTactics {
  id: string | number;
  object_marking_refs: string[];
  type: string;
  name: string;
  description: string;
  x_mitre_shortname: string;
  modified: string;
  created: string;
  created_by_ref: string;
  external_references: ExternalReference[];
  spec_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_domains: string[];
  x_mitre_modified_by_ref: string;
  x_mitre_version: string;
}

export interface TechToSubTech {
  object_marking_refs: string[];
  type: string;
  id: string;
  target_ref: string;
  modified: string;
  source_ref: string;
  created_by_ref: string;
  relationship_type: string;
  created: string;
  spec_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_domains: string[];
  x_mitre_modified_by_ref: string;
  x_mitre_version: string;
}

export interface InMiterTechnique {
  id: string | number;

  object_marking_refs: string[];
  type: string;
  name: string;
  x_mitre_data_sources: string[];
  x_mitre_version: string;
  modified: string;
  created: string;
  x_mitre_platforms: string[];
  x_mitre_is_subtechnique: boolean;
  description: string;
  kill_chain_phases: Array<KillChainPhase>;
  x_mitre_detection: string;
  created_by_ref: string;
  external_references: ExternalReference[];
  spec_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_domains: string[];
  x_mitre_modified_by_ref: string;
  x_mitre_deprecated?: boolean;
  target_ref?: string;
  relationship_type?: string;
  source_ref?: string;
  sub_technique_of: string;
}

export interface InTableMatrixColumn {
  id: string | number;
  name: string;
  description: string;
  type: string;
  modified: string;
  created: string;
  attack_version: string;
  attack_id: string;
}

export interface InTableTacticColumn {
  id2: string | number;
  id: string | number;
  matrix_id: number;
  name: string;
  description: string;
  type?: string;
  modified: string;
  created: string;
  attack_version: string;
  attack_id: string;
  ordinal_position: number;
}

export interface InTableTechniqueColumn {
  id2: string | number;
  sub_technique_of_ID?: string;
  id: string | number;
  type?: string;
  name: string;
  x_mitre_version?: string;
  description: string;
  x_mitre_detection?: string;
  created_by_ref?: string;
  spec_version?: string;
  x_mitre_attack_spec_version?: string;
  x_mitre_modified_by_ref?: string;
  x_mitre_deprecated?: boolean;
  is_sub_technique: boolean;
  object_marking_refs?: string[];
  target_ref?: string;
  relationship_type?: string;
  x_mitre_domains?: string[];
  sub_technique_of: number | string;
  modified: string;
  created: string;
  attack_id: string;
}

export interface ExternalReference {
  url: string;
  external_id?: string;
  source_name: string;
  description?: string;
}

export interface KillChainPhase {
  kill_chain_name: string;
  phase_name: string;
}
