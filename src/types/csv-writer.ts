import fs from 'fs';
import path from 'path';
import { writeDataToCSVFile } from '../utils/csv-writer';
import {
  InJSONDataType,
  InMatrix,
  InMiterMatrix,
  InMiterTactics,
  InMiterTechnique,
  InTableMatrixColumn,
  InTableTacticColumn,
  InTableTechniqueColumn,
  TechToSubTech,
  TechToTactic,
} from '../controller/types';
import { MITER_TYPE } from '../constants/constants';

export async function getDataFromJSON(): Promise<void> {
  try {
    const jsonPath = path.join('mitter', 'enterprise-attack.json');
    const rawdata = fs.readFileSync(jsonPath);
    const miteData: InMatrix = JSON.parse(rawdata.toString()); // convert buffer to string
    await filterData(miteData);
  } catch (err: any) {
    console.log(err.stack);
  }
}

const allData = {};

const filePath = {
  matrix: path.join('CSVS', 'attack_matrix.csv'),
  Tectic: path.join('CSVS', 'tactic.csv'),
  techniques: path.join('CSVS', 'technique.csv'),
  TecToTactic: path.join('CSVS', 'technique_to_tactic.csv'),
  TecToTactic_missing_records: path.join('CSVS', 'TecToTactic_missing_records.csv'),
};

const filterData = async (jsonData: InMatrix) => {
  // NOTE genrate Matrix
  const { objects } = jsonData;

  const tacticIds: string[] = await writeMatrixToCSV({
    fileName: filePath.matrix,
    jsonData: objects as InMiterMatrix[],
  });

  // NOTE genrate Tectic
  const teatics = await writeTacticToCSV({
    tacticIds,
    fileName: filePath.Tectic,
    jsonData: objects as InMiterTactics[],
  });
  // NOTE genrate Technique
  const techniques = await writeTechniqueToCSV({
    fileName: filePath.techniques,
    jsonData: objects as InMiterTechnique[],
    TToSubTechnique: objects as TechToSubTech[],
  });
  // NOTE genrate TechniqueToTactic
  const tecToTactic = await writeTechniqueToTacticCSV({
    fileName: filePath.TecToTactic,
    teatics,
    techniques,
  });

  const parseData = path.join('CSVS', 'transformed_JSON_Data.json');
  await fs.writeFile(parseData, JSON.stringify(allData), function (err) {
    if (err) throw err;
    console.log('++++++++++++++++++++complete transformed_JSON_Data.json file++++++++++++++++++++');
  });
  console.log(`******end*********`);
};

const findDataObject = (jsonData: InJSONDataType[], condition: string) =>
  jsonData.filter((item) => item.type === condition);

async function writeMatrixToCSV({
  fileName,
  jsonData,
}: {
  fileName: string;
  jsonData: InMiterMatrix[];
}): Promise<string[]> {
  try {
    const matrixJSON = findDataObject(jsonData, MITER_TYPE.MATRIX) as InMiterMatrix[];

    // // map tactic string ids with number and save them in keys objecy
    // matrixJSON.map(({ id }, index) => {
    //   keys.matrix[id] = index + 1;
    // });

    const objectArray = matrixJSON.map(mapMatrixTableColumn);
    await writeDataToCSVFile({ fileName, objectArray });
    console.log('\n ****************Successfull created:::', fileName);
    return matrixJSON[0].tactic_refs;
  } catch (err: any) {
    console.log(`writeMatrixToCSV: ${err.stack}`);
    throw err;
  }
}
interface Keys {
  tacticIds: Record<string, number>;
  techniquesIDs: Record<string, number>;
  matrix: Record<string, number>;
}
let keys: Keys = {
  tacticIds: {},
  techniquesIDs: {},
  matrix: {},
};
async function writeTacticToCSV({
  tacticIds,
  fileName,
  jsonData,
}: {
  fileName: string;
  tacticIds: string[];
  jsonData: InMiterTactics[];
}) {
  try {
    const jsonArr = jsonData.filter((item) => tacticIds.includes(String(item.id)) && item.type === MITER_TYPE.TECTIC);

    // map tactic string ids with number and save them in keys objecy
    jsonArr.map(({ id }, index) => {
      keys.tacticIds[id] = index + 1;
    });

    const tableColumn = jsonArr.map(mapTacticTableColumn) as any;
    await writeDataToCSVFile({ fileName, objectArray: tableColumn });
    // @ts-ignore
    allData['tactic'] = tableColumn;
    console.log('\n ****************Successfull created:::', fileName);
    return jsonArr;
  } catch (err: any) {
    console.log(`writeMatrixToCSV: ${err.stack}`);
    throw err;
  }
}

async function writeTechniqueToCSV({
  fileName,
  jsonData,
  TToSubTechnique,
}: {
  fileName: string;
  jsonData: InMiterTechnique[];
  TToSubTechnique: TechToSubTech[];
}) {
  try {
    // get all techniquesData
    const techniquesData = findDataObject(jsonData, MITER_TYPE.TECHNIQUE) as InMiterTechnique[];
    let techniques = {} as Record<string, InMiterTechnique>;

    //
    techniquesData.forEach((technique, index) => {
      techniques[technique.id] = technique as InMiterTechnique; // technique id
    });

    const TTSTRelationship = [] as any;
    TToSubTechnique.forEach((TTTRelationship) => {
      /*   if (subTechData?.name === 'Scanning IP Blocks' || subTechData?.name === 'Active Scanning') {
        console.log(`s1`);
        if (
          TTTRelationship.relationship_type === MITER_TYPE.RELATIONSHIP_OF &&
          TTTRelationship.type === MITER_TYPE.RELATIONSHIP &&
          TTTRelationship.target_ref &&
          TTTRelationship.source_ref &&
          techniques[TTTRelationship.target_ref] // parent technique id
        ) {
          console.log(`s1`);
        } else {
          console.log(`s1`);
        }
      } */
      if (
        TTTRelationship.relationship_type === MITER_TYPE.RELATIONSHIP_OF &&
        TTTRelationship.type === MITER_TYPE.RELATIONSHIP &&
        TTTRelationship.target_ref &&
        TTTRelationship.source_ref &&
        techniques[TTTRelationship.target_ref] // parent technique id
      ) {
        // NOTE  sub-technique
        //NOTE  now attaching parentID with their sub-teachnique
        const subTechID = TTTRelationship.source_ref;
        const parentTechID = TTTRelationship.target_ref;
        const subTechData = techniques[subTechID];

        techniques[subTechID] = { ...subTechData, sub_technique_of: parentTechID };
        // console.log(`s1`);
      } else {
        // NOTE  technique
      }
    });

    const tectniquesTransformData: InMiterTechnique[] = [];

    Object.keys(techniques).map((techniqueID: string, index) => {
      // NOTE if technique is depricated then dont add in CSV
      if (techniques[techniqueID]?.x_mitre_deprecated != true) {
        const techniqueObject = techniques[techniqueID];
        // console.log(`techniques[techniqueID].x_mitre_deprecated:::`, techniques[techniqueID].x_mitre_deprecated);
        // map string ids with number and save them in keys objecy

        // NOTE  technique
        // map technique string ids with number and save them in keys objecy
        keys.techniquesIDs[techniqueObject.id] = index + 1;
        tectniquesTransformData.push(techniqueObject);
      }
    }) as any;

    const tableColumn: any[] = tectniquesTransformData.map(mapTechniqueTableColumn);

    await writeDataToCSVFile({ fileName, objectArray: tableColumn });
    // @ts-ignore
    allData['techniquesData'] = tableColumn;
    console.log('\n ****************Successfull created:::', fileName);
    return techniquesData;
  } catch (err: any) {
    console.log(`writeTechniqueToCSV: ${err.stack}`);
    throw err;
  }
}

async function writeTechniqueToTacticCSV({
  fileName,
  teatics,
  techniques,
}: {
  fileName: string;
  teatics: InMiterTactics[];
  techniques: InMiterTechnique[];
}) {
  try {
    const techniqueToTactic: Array<TechToTactic> = [];
    const missingEntry = [] as any[];
    let tectic: any = {};
    teatics.forEach((teatic) => {
      tectic[teatic.x_mitre_shortname] = teatic;
    });
    techniques.forEach((technique, index) => {
      if (technique?.kill_chain_phases) {
        technique?.kill_chain_phases?.forEach((value) => {
          let tempTactic = tectic[value.phase_name] as {};
          // console.log(`value:::`, value);
          // console.log(`tempTactic:::`, tempTactic);
          if (tempTactic && technique.x_mitre_is_subtechnique === false) {
            // @ts-ignore
            const tacticID = keys.tacticIds[tempTactic.id];
            const techniqueID = keys.techniquesIDs[technique.id];
            if (tacticID && techniqueID) {
              // @ts-ignore
              const temp = {
                tactic_id: tacticID,
                technique_id: techniqueID,
                id2: technique.id,
              };
              // @ts-ignore
              techniqueToTactic.push(temp);
            } else {
              // console.log(`s1`);
            }
          }
        });
      } else {
        missingEntry.push(technique);
      }
    });

    // const tableColumn = jsonArr.map(mapTechniqueTableColumn) as any;
    await writeDataToCSVFile({ fileName, objectArray: techniqueToTactic });
    // @ts-ignore
    allData['techniqueToTactic'] = techniqueToTactic;
    if (missingEntry.length) {
      await writeDataToCSVFile({ fileName: filePath.TecToTactic_missing_records, objectArray: missingEntry });
    }
    console.log('\n ****************Successfull created:::', fileName);
  } catch (err: any) {
    console.log(`writeTechniqueToCSV: ${err.stack}`);
    throw err;
  }
}

function mapMatrixTableColumn(item: InMiterMatrix): InTableMatrixColumn {
  return {
    id: 1,
    name: String(item.name),
    description: String(item.description),
    type: String(item.type),
    modified: String(item.modified),
    created: String(item.created),
    attack_version: String(item.spec_version),
    attack_id: '11',
  };
}

let mapTacticTableColumn = (item: InMiterTactics): InTableTacticColumn => {
  const TacticPosition: Record<string, number> = {
    Reconnaissance: 1,
    'Resource Development': 2,
    'Initial Access': 3,
    Execution: 4,
    Persistence: 5,
    'Privilege Escalation': 6,
    'Defense Evasion': 7,
    'Credential Access': 8,
    Discovery: 9,
    'Lateral Movement': 10,
    Collection: 11,
    'Command and Control': 12,
    Exfiltration: 13,
    Impact: 14,
  };

  return {
    id2: item.id,
    id: keys.tacticIds[item.id] ?? 0,
    name: String(item.name),
    description: String(item.description),
    matrix_id: 1,
    // type: String(item.type),
    modified: String(item.modified),
    created: String(item.created),
    attack_version: String(item.spec_version),
    attack_id: String(item.external_references[0]?.external_id),
    ordinal_position: TacticPosition[item.name],
  };
};

let mapTechniqueTableColumn = (item: InMiterTechnique): InTableTechniqueColumn => {
  return {
    id2: item.id,
    id: keys.techniquesIDs[item.id] ?? null,
    name: item.name || '',
    description: item.description || '',
    // author: item.type),
    is_sub_technique: Boolean(item.x_mitre_is_subtechnique),
    // sub_technique_of: Number(item.source_ref) || 1,
    sub_technique_of: keys.techniquesIDs[item.sub_technique_of] ?? null,
    sub_technique_of_ID: item.sub_technique_of,
    // x_mitre_version: item.x_mitre_version),
    // x_mitre_detection: item.x_mitre_detection),
    // created_by_ref: item.created_by_ref),
    // spec_version: item.spec_version),
    // x_mitre_attack_spec_version: item.x_mitre_attack_spec_version),
    // x_mitre_modified_by_ref: item.x_mitre_modified_by_ref),
    // x_mitre_deprecated: Boolean(item.x_mitre_deprecated),
    created: item.created,
    modified: item.modified,
    attack_id: item.external_references[0]?.external_id || '',
  };
};
