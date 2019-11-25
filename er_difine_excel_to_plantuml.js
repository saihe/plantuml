// 初期化
const fs = require("fs");
const utils = require("./utils");
const XLSX = require("xlsx");
const book = XLSX.readFile("テーブル定義書.xlsx");
const systemName = "ICD_P2P";
const outputFile = "er.plantuml";

// オブジェクト宣言
let outputContext = [];
let tableName = {
  logical: "",
  figical: ""
}
let colmun = {
  logicalColmunName: "",
  figicalColmunName: "",
  domainName: "",
  dataType: "",
  notNull: "",
  indentity: "",
  defaultValue: "",
  remark: ""
}
let index = {
  name: "",
  colmuns: [],
  foreign: "",
  cascade: "",
  unique: "",
  remark: ""
}
let entity = {
  tableName: {},
  colmuns: [],
  indexes: []
}
let entities = [];

function findIndex(indexes, colmun) {
  return indexes.filter(index => {
    console.log(index.colmuns);
    // if (index.colmuns.filter(col => col == colmun.figicalColmunName)) {
    //   return true;
    // }
  })
}


// アプリユーザのDDL作成（サンプル）
let workSheet = book.Sheets["アプリユーザ"]
let range = workSheet['!ref'];
let rangeValue = XLSX.utils.decode_range(range);

let schema = "";
try{
  for (var rowCount = rangeValue.s.r; rowCount < rangeValue.e.r; rowCount++) {
    if (workSheet[XLSX.utils.encode_cell({c:0, r:rowCount})] != undefined){
      if (workSheet[XLSX.utils.encode_cell({c:0, r:rowCount})].v == "エンティティ情報") {
        schema = "entity";
        rowCount++;
        continue;
      }
      if (workSheet[XLSX.utils.encode_cell({c:0, r:rowCount})].v == "カラム情報") {
        schema = "colmun";
        rowCount++;
        continue;
      }
      if (workSheet[XLSX.utils.encode_cell({c:0, r:rowCount})].v == "インデックス情報") {
        schema = "index";
        rowCount++;
        continue;
      }
  
      if (schema == "entity") {
        tableName.logical = workSheet.A3.v;
        tableName.figical = workSheet.C3.v;
        entity.tableName = tableName;
      }
      if (schema == "colmun") {
        colmun = {};
        colmun.logicalColmunName = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:1, r:rowCount})]).v;
        colmun.figicalColmunName = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:2, r:rowCount})]).v;
        colmun.domainName = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:3, r:rowCount})]).v;
        colmun.dataType = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:4, r:rowCount})]).v;
        colmun.notNull = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:5, r:rowCount})]).v;
        colmun.indcolmun = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:6, r:rowCount})]).v;
        colmun.defaultValue = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:7, r:rowCount})]).v;
        colmun.remark = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:8, r:rowCount})]).v;
        entity.colmuns.push(colmun);
      }
      if (schema == "index") {
        index = {};
        index.name = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:1, r:rowCount})]).v;
        index.foreign = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:3, r:rowCount})]).v;
        index.cascade = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:4, r:rowCount})]).v;
        index.unique = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:5, r:rowCount})]).v;
        index.remark = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:8, r:rowCount})]).v;
  
        index.colmuns = [];
        const tmpColmuns = utils.defaultCellString(workSheet[XLSX.utils.encode_cell({c:2, r:rowCount})]).v.split(",");
        tmpColmuns.forEach(ti => {
          index.colmuns.push(ti.trim());
        });
        entity.indexes.push(index);
      }
    }
  }
  entities.push(entity);
} catch (e) {
  console.log("データ取得エラー", e);
}

// PlantUMLテキストファイル出力
try {
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  outputContext.push("@startuml " + systemName);
  entities.forEach(e => {
    if (e.tableName.figical != undefined) {
      // 整形
      outputContext.push("entity \"" + e.tableName.logical + "\" as " + e.tableName.figical + "{");
      e.colmuns.forEach(c => {
        if (e.indexes.length > 0) {
          if (findIndex(e.indexes, c)) {
            console.log("インデックスあり");
            console.log(c);
          }
          e.indexes.forEach(i => {
            if (
              i.colmuns.match(idx => idx == c.figicalColmunName)
              && i.name.match(/^pk_*$/)
            ) {
              console.log("PKあり");
              outputContext.push(
                "* **"
                + c.logicalColmunName
                + " "
                + c.figicalColmunName
                + " "
                + c.dataType
                + " "
                + ((c.indentity == "yes") ? "Identity " : "")
                + ((c.notNull == "yes") ? "Not Null " : "")
                + " "
                + "[pk]"
                + " **"
              );
            }
          });
        } else {
          outputContext.push(
            ""
            + c.logicalColmunName
            + " "
            + c.figicalColmunName
            + " "
            + c.dataType
            + " "
            + ((c.indentity == "yes") ? "Identity " : "")
            + ((c.notNull == "yes") ? "Not Null " : "")
            + ""
          );
        }
      });
    }
  });
  outputContext.push("}");
  outputContext.push("@enduml");
  fs.writeFileSync(outputFile, outputContext.join("\n"), {encoding: "UTF-8"});
} catch(e) {
  console.log("ファイル出力エラー", e);
}
