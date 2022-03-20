const createCsvWriter = require('csv-writer').createObjectCsvWriter;

export const writeDataToCSVFile = async ({ fileName, objectArray }: { fileName: string; objectArray: Array<any> }) => {
  try {
    if (Array.isArray(objectArray) && objectArray.length > 0) {
      const csvHeaders = Object.keys(objectArray[0]).map((item) => ({ id: item, title: item }));
      const csvWriter = createCsvWriter({ path: fileName, header: csvHeaders });
      await csvWriter.writeRecords(objectArray); // returns a promise
    }
  } catch (err) {
    console.log(`err:::`, err);
    throw err;
  }
};
