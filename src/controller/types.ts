export interface InMatrix {
  type: string;
  id: string;
  spec_version: string;
  objects: Array<InJSONDataType>;
}
export type InJSONDataType = InMiterTactics | InMiterMatrix | InMiterTechnique;
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

export interface InMiterTactics {
  object_marking_refs: string[];
  type: string;
  name: string;
  description: string;
  x_mitre_shortname: string;
  modified: string;
  id: string;
  created: string;
  created_by_ref: string;
  external_references: ExternalReference[];
  spec_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_domains: string[];
  x_mitre_modified_by_ref: string;
  x_mitre_version: string;
}

export interface InMiterTechnique {
  object_marking_refs: string[];
  type: string;
  name: string;
  x_mitre_data_sources: string[];
  x_mitre_version: string;
  modified: string;
  created: string;
  x_mitre_platforms: string[];
  x_mitre_is_subtechnique: boolean;
  id: string;
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
}

export interface InTableMatrixColumn {
  id: string;
  name: string;
  description: string;
  type: string;
  modified: string;
  created: string;
  spec_version: string;
}

export interface InTableTacticColumn {
  id: string;
  name: string;
  description: string;
  type: string;
  modified: string;
  created: string;
  spec_version: string;
}

export interface InTableTechniqueColumn {
  type: string;
  name: string;
  x_mitre_version: string;
  modified: string;
  created: string;
  id: string;
  description: string;
  x_mitre_detection: string;
  created_by_ref: string;
  spec_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_modified_by_ref: string;
  x_mitre_deprecated: boolean;
  x_mitre_is_subtechnique: boolean;
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
