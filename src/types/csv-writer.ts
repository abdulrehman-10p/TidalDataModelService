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

const filePath = {
  matrix: path.join('CSVS', 'attack_matrix.csv'),
  Tectic: path.join('CSVS', 'tactic.csv'),
  techniques: path.join('CSVS', 'technique.csv'),
  TecToTactic: path.join('CSVS', 'technique_to_tactic.csv'),
  TecToTactic_missing_records: path.join('CSVS', 'TecToTactic_missing_records.csv'),
};
const filterJSONObjects = {} as any;
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
    const objectArray = matrixJSON.map(mapMatrixTableColumn);
    await writeDataToCSVFile({ fileName, objectArray });
    console.log('\n ****************Successfull created:::', fileName);
    return matrixJSON[0].tactic_refs;
  } catch (err: any) {
    console.log(`writeMatrixToCSV: ${err.stack}`);
    throw err;
  }
}

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
    const jsonArr = jsonData.filter((item) => tacticIds.includes(item.id) && item.type === MITER_TYPE.TECTIC);
    const tableColumn = jsonArr.map(mapTacticTableColumn) as any;
    await writeDataToCSVFile({ fileName, objectArray: tableColumn });
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
    const jsonArr = findDataObject(jsonData, MITER_TYPE.TECHNIQUE) as InMiterTechnique[];
    let techniques: any = {};
    jsonArr.forEach((technique) => {
      techniques[technique.id] = technique; // technique id
    });

    const TTSTRelationship = [] as any;
    TToSubTechnique.forEach((TTTRelationship) => {
      if (
        TTTRelationship.relationship_type === MITER_TYPE.RELATIONSHIP_OF &&
        TTTRelationship.type === MITER_TYPE.RELATIONSHIP &&
        TTTRelationship.target_ref &&
        TTTRelationship.source_ref &&
        techniques[TTTRelationship.target_ref] // parent technique id
      ) {
        techniques[TTTRelationship.target_ref] = {
          ...techniques[TTTRelationship.target_ref],
          source_ref: TTTRelationship.source_ref,
        };
      }
    });
    const tableColumn = Object.keys(techniques).map((techniqueID: string) => {
      return mapTechniqueTableColumn(techniques[techniqueID]);
    }) as any;

    await writeDataToCSVFile({ fileName, objectArray: tableColumn });
    console.log('\n ****************Successfull created:::', fileName);
    return jsonArr;
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
          let tempTechnique = tectic[value.phase_name] as {};
          // console.log(`value:::`, value);
          // console.log(`tempTechnique:::`, tempTechnique);
          if (true) {
            if (tempTechnique && technique.x_mitre_is_subtechnique === false) {
              // @ts-ignore
              techniqueToTactic.push({ t_t_id: index, tactic_id: tempTechnique.id, TechniqueId: technique.id });
            }
          }
        });
      } else {
        missingEntry.push(technique);
      }
    });

    // const tableColumn = jsonArr.map(mapTechniqueTableColumn) as any;
    await writeDataToCSVFile({ fileName, objectArray: techniqueToTactic });
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
    id: String(item.id),
    name: String(item.name),
    description: String(item.description),
    type: String(item.type),
    modified: String(item.modified),
    created: String(item.created),
    version: String(item.spec_version),
  };
}

let mapTacticTableColumn = (item: InMiterTactics): InTableTacticColumn => {
  return {
    id: String(item.id),
    name: String(item.name),
    description: String(item.description),
    type: String(item.type),
    modified_date: String(item.modified),
    created_date: String(item.created),
    version: String(item.spec_version),
  };
};

let mapTechniqueTableColumn = (item: InMiterTechnique): InTableTechniqueColumn => {
  return {
    id: String(item.id),
    name: String(item.name),
    description: String(item.description),
    type: String(item.type),
    is_sub_technique: Boolean(item.x_mitre_is_subtechnique),
    sub_technique_of: String(item.source_ref),
    x_mitre_version: String(item.x_mitre_version),
    x_mitre_detection: String(item.x_mitre_detection),
    created_by_ref: String(item.created_by_ref),
    spec_version: String(item.spec_version),
    x_mitre_attack_spec_version: String(item.x_mitre_attack_spec_version),
    x_mitre_modified_by_ref: String(item.x_mitre_modified_by_ref),
    x_mitre_deprecated: Boolean(item.x_mitre_deprecated),
    created_date: String(item.created),
    modified_date: String(item.modified),
  };
};
