module.exports = function() {
  var day = new Date().getDate();
  var month = new Date().getMonth()+1;
  var year = new Date().getFullYear();
  if (day < 10) {
    day = "0"+day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  return day+'.'+month+'.'+year;
}
