const SHEET_NAME = "Leads";


function getSheet() {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error("Лист Leads не найден.");
  }
  return sheet;
}


/** 
 * Возвращает список лидов
 */

function doGet() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return createResponse([]);
  }

  const headers = values[0];
  const data = [];
  for (let i = 1; i < values.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[i][index];
    });
    data.push(row);
  }
  return createResponse(data);
}


/**
 * POST
 *
 * create
 * update
 */

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const lead = body.lead;
    if (action === "create") {
      createLead(lead);
      return createResponse({
        success: true,
        message: "Лид успешно сохранён."
      });
    }

    if (action === "update") {
      updateLead(lead);
      return createResponse({
        success: true,
        message: "Этап сделки обновлён."
      });

    }

    return createResponse({
      success: false,
      message: "Неизвестное действие."
    });

  }

  catch (error) {
    return createResponse({
      success: false,
      message: error.toString()
    });
  }
}


/**
 * Создание лида
 */

function createLead(lead) {

  const sheet = getSheet();
 /*   sheet
    .getRange(row, 1)
    .setNumberFormat("@");
  sheet
    .getRange(row, 3)
    .setNumberFormat("@");*/
  sheet.appendRow([
    lead.id,
    lead.name,
    String(lead.phone),
    lead.source,
    lead.owner,
    lead.stage,
    lead.tz,
    lead.created
  ]);

}


/**
 * Обновление этапа
 */

function updateLead(lead) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(lead.id)) {
      // столбец F
      sheet.getRange(i + 1, 6).setValue(lead.stage);
      return;
    }
  }
}


/**
 * Ответ JSON
 */

function createResponse(object) {
  return ContentService
    .createTextOutput(
      JSON.stringify(object)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
