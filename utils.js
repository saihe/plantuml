module.exports = {
  defaultCellString: (cell) => {
    if (cell == undefined) {
      return {
        v: ""
      }
    } else {
      return cell
    }
  },
}