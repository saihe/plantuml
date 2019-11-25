const XLSX = require("xlsx");
const Utils = XLSX.utils; // XLSX.utilsのalias
// Workbookの読み込み
const book = XLSX.readFile("テーブル定義書.xlsx");
// 全シート名出力
const sheet1 = book.Sheets["Sheet1"];