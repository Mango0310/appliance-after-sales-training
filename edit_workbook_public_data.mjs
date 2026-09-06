import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "outputs/家电售后知识库项目/AI赋能家电售后知识库与客服培训体系.xlsx";
const outputPath = "outputs/家电售后知识库项目/AI赋能家电售后知识库与客服培训体系_公开资料版.xlsx";
const previewDir = "outputs/家电售后知识库项目/公开资料版预览";
const verified = JSON.parse(await fs.readFile("verified_knowledge.json", "utf8"));
await fs.mkdir(previewDir, { recursive: true });

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

// Render an existing representative sheet before editing to preserve its visual language.
const before = await wb.render({ sheetName: "售后知识库", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${previewDir}/编辑前_售后知识库.png`, new Uint8Array(await before.arrayBuffer()));

const navy = "#20364A", teal = "#2D7F7A", pale = "#EAF4F2", red = "#C94C4C";
function setupTitle(sheet, endCol, title, subtitle) {
  sheet.getRange(`A1:${endCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endCol}1`).format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
  sheet.getRange(`A1:${endCol}1`).format.rowHeight = 34;
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endCol}2`).format = { fill: pale, font: { color: navy, italic: true, size: 10 }, wrapText: true };
  sheet.getRange(`A2:${endCol}2`).format.rowHeight = 28;
  sheet.showGridLines = false;
}
function styleHeader(range) {
  range.format = { fill: teal, font: { bold: true, color: "#FFFFFF" }, wrapText: true, verticalAlignment: "center",
    borders: { bottom: { style: "medium", color: navy } } };
  range.format.rowHeight = 30;
}
function styleBody(range) {
  range.format = { font: { color: "#243442", size: 10 }, wrapText: true, verticalAlignment: "top",
    borders: { insideHorizontal: { style: "thin", color: "#DCE3E8" } } };
}

const sources = wb.worksheets.add("公开资料来源台账");
setupTitle(sources, "J", "公开资料来源台账", "仅收录品牌官方说明书和官方支持页面｜用于追溯知识条目的原始依据");
const sourceRows = [
  ["SRC001","Philips","空气炸锅","Airfryer相关型号","Airfryer Instruction Manual","Before first use / Important safeguards / Troubleshooting","官方说明书","https://www.documents.philips.com/assets/20210512/7d66549c3d5c4d2299efad26006bc54d.pdf",new Date("2026-08-30"),"已复核"],
  ["SRC002","Philips","空气炸锅","页面列示适用型号","How to clean my Philips Airfryer","Pan and basket / Heating element","官方支持页面","https://www.usa.philips.com/c-f/XC000012903/how-to-clean-my-philips-airfryer",new Date("2026-08-30"),"已复核"],
  ["SRC003","Panasonic","电热水壶","NC-K101 / NC-K301","Operating Instructions","Safety / Filling / Pouring / Cleaning","官方说明书","https://www.panasonic.com/content/dam/Panasonic/Asia/Operating-Instructions/Operating-Instructions-NC-K101WSK.pdf",new Date("2026-08-30"),"已复核"],
  ["SRC004","Panasonic","电热水壶","NC-SK1","Operating Instructions","Safety / Use / Cleaning / Troubleshooting","官方说明书","https://www.panasonic.com/content/dam/Panasonic/vn/vi/Support/Operating-Installation-Instructions/04-Operation-Instruction-NC-SK1.pdf",new Date("2026-08-30"),"已复核"]
];
sources.getRange("A3:J3").values = [["来源编号","品牌","产品类别","适用型号","资料名称","使用章节","资料类型","官方链接","提取日期","复核状态"]];
styleHeader(sources.getRange("A3:J3"));
sources.getRange("A4:J7").values = sourceRows;
styleBody(sources.getRange("A4:J7"));
sources.getRange("I4:I7").format.numberFormat = "yyyy-mm-dd";
sources.getRange("J4:J7").conditionalFormats.add("containsText", { text: "已复核", format: { fill: "#E5F5ED", font: { color: "#257A55", bold: true } } });
sources.tables.add("A3:J7", true, "PublicSourcesTable").style = "TableStyleMedium2";
sources.freezePanes.freezeRows(3);
[12,14,14,22,30,34,16,56,13,12].forEach((w,i)=>sources.getRangeByIndexes(0,i,7,1).format.columnWidth=w);

const urlToId = new Map(sourceRows.map(r => [r[7], r[0]]));
const publicKb = wb.worksheets.add("公开资料知识库");
setupTitle(publicKb, "P", "公开资料知识库", "20条经官方公开资料整理的结构化知识｜具体型号规则不可自动泛化至所有家电");
const knowledgeRows = verified.map((r) => {
  const [id, product, category, question, answer, steps, action, risk, escalation, infoType, version, applicability, url] = r;
  return [id, product, category, question, answer, steps, action, risk, escalation, applicability, urlToId.get(url) || "", infoType, version, new Date("2026-08-30"), "已复核", url];
});
publicKb.getRange("A3:P3").values = [["知识编号","产品类别","问题分类","用户常见问法","标准答案","排查步骤","客服行动","风险等级","升级条件","适用范围/章节","来源编号","信息性质","版本号","复核日期","复核状态","官方链接"]];
styleHeader(publicKb.getRange("A3:P3"));
publicKb.getRange(`A4:P${3+knowledgeRows.length}`).values = knowledgeRows;
styleBody(publicKb.getRange(`A4:P${3+knowledgeRows.length}`));
publicKb.getRange(`N4:N${3+knowledgeRows.length}`).format.numberFormat = "yyyy-mm-dd";
publicKb.getRange(`H4:H${3+knowledgeRows.length}`).conditionalFormats.add("containsText", { text: "高", format: { fill: "#FDE8E8", font: { color: red, bold: true } } });
publicKb.getRange(`O4:O${3+knowledgeRows.length}`).conditionalFormats.add("containsText", { text: "已复核", format: { fill: "#E5F5ED", font: { color: "#257A55", bold: true } } });
publicKb.tables.add(`A3:P${3+knowledgeRows.length}`, true, "VerifiedKnowledgeTable").style = "TableStyleMedium2";
publicKb.freezePanes.freezeRows(3); publicKb.freezePanes.freezeColumns(3);
[11,14,14,28,42,42,25,10,30,34,12,18,10,13,12,55].forEach((w,i)=>publicKb.getRangeByIndexes(0,i,3+knowledgeRows.length,1).format.columnWidth=w);

const check = await wb.inspect({ kind: "table", range: "公开资料知识库!A1:P23", include: "values,formulas", tableMaxRows: 23, tableMaxCols: 16, maxChars: 8000 });
console.log(check.ndjson);
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 200 }, summary: "final formula error scan" });
console.log(errors.ndjson);

for (const name of ["项目看板","售后知识库","标准话术","月考题库","成绩明细","模块分析","咨询记录","公开资料来源台账","公开资料知识库"]) {
  const img = await wb.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${previewDir}/${name}.png`, new Uint8Array(await img.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputPath);
console.log(`EXPORTED ${outputPath}`);
