import fs from 'fs';
import path from 'path';
import { writeDataToCSVFile } from '../utils/csv-writer';
import {
  InMatrix,
  InMiterMatrix,
  InMiterTactics,
  InMiterTechnique,
  InTableMatrixColumn,
  InTableTacticColumn,
  InTableTechniqueColumn,
} from '../controller/types';

export async function getDataFromJSON(): Promise<void> {
  try {
    const jsonPath = path.join('mitter', 'enterprise-attack.json');
    const rawdata = fs.readFileSync(jsonPath);
    const miteData: InMatrix = JSON.parse(rawdata.toString()); // convert buffer to string
    await filterData(miteData);
  } catch (err: any) {
    console.log(err.toString());
  }
}

const filePath = {
  matrix: path.join('CSVS', 'matrix.csv'),
  Tectic: path.join('CSVS', 'tactics.csv'),
  technique: path.join('CSVS', 'technique.csv'),
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
  await writeTacticToCSV({
    tacticIds,
    fileName: filePath.Tectic,
    jsonData: objects as InMiterTactics[],
  });
  // NOTE genrate Technique
  await writeTechniqueToCSV({
    fileName: filePath.technique,
    jsonData: objects as InMiterTechnique[],
  });
};

export enum MITER_TYPE {
  MATRIX = `x-mitre-matrix`,
  TECTIC = 'x-mitre-tactic',
  TECHNIQUE = 'attack-pattern',
}

async function writeMatrixToCSV({
  fileName,
  jsonData,
}: {
  fileName: string;
  jsonData: InMiterMatrix[];
}): Promise<string[]> {
  try {
    const matrixJSON: InMiterMatrix[] = jsonData.filter((item) => item.type === MITER_TYPE.MATRIX);
    const objectArray = matrixJSON.map(mapMatrixTableColumn);
    await writeDataToCSVFile({ fileName, objectArray });
    console.log('\n ****************Successfull created:::', fileName);
    return matrixJSON[0].tactic_refs;
  } catch (err: any) {
    console.log(`writeMatrixToCSV: ${err.toString()}`);
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
  } catch (err: any) {
    console.log(`writeMatrixToCSV: ${err.toString()}`);
  }
}

async function writeTechniqueToCSV({ fileName, jsonData }: { fileName: string; jsonData: InMiterTechnique[] }) {
  try {
    const jsonArr = jsonData.filter((item) => item.type === MITER_TYPE.TECHNIQUE);
    const tableColumn = jsonArr.map(mapTechniqueTableColumn) as any;
    await writeDataToCSVFile({ fileName, objectArray: tableColumn });
    console.log('\n ****************Successfull created:::', fileName);
  } catch (err: any) {
    console.log(`writeTechniqueToCSV: ${err.toString()}`);
  }
}

async function writeTechniqueToTacticCSV({ fileName, jsonData }: { fileName: string; jsonData: InMiterTechnique[] }) {
  try {
    const jsonArr = jsonData.filter((item) => item.type === MITER_TYPE.TECHNIQUE);
    filterJSONObjects[MITER_TYPE.TECHNIQUE] = jsonArr;
    const tableColumn = jsonArr.map(mapTechniqueTableColumn) as any;
    await writeDataToCSVFile({ fileName, objectArray: tableColumn });
    console.log('\n ****************Successfull created:::', fileName);
  } catch (err: any) {
    console.log(`writeTechniqueToCSV: ${err.toString()}`);
  }
}

function mapMatrixTableColumn(item: InMiterMatrix): InTableMatrixColumn {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type,
    modified: item.modified,
    created: item.created,
    spec_version: item.spec_version,
  };
}

let mapTacticTableColumn = (item: InMiterTactics): InTableTacticColumn => {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type,
    modified: item.modified,
    created: item.created,
    spec_version: item.spec_version,
  };
};

let mapTechniqueTableColumn = (item: InMiterTechnique): InTableTechniqueColumn => {
  return {
    type: item.type,
    name: item.name,
    x_mitre_version: item.x_mitre_version,
    modified: item.modified,
    created: item.created,
    id: item.id,
    description: item.description,
    x_mitre_detection: item.x_mitre_detection,
    created_by_ref: item.created_by_ref,
    spec_version: item.spec_version,
    x_mitre_attack_spec_version: item.x_mitre_attack_spec_version,
    x_mitre_modified_by_ref: item.x_mitre_modified_by_ref,
    x_mitre_is_subtechnique: item.x_mitre_is_subtechnique,
  };
};
