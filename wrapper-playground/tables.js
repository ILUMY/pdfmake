/**
 * Created by finde on 16/03/15.
 */

'use strict';

var path = require("path");
var PdfWrapper = require('../libs/PdfWrapper');
var _ = require('lodash');

function mp(relFontPath) {
  return path.resolve(__dirname, relFontPath)
}

var fonts = {
  Roboto: {
    normal: mp('fonts/Roboto-Regular.ttf'),
    bold: mp('fonts/Roboto-Medium.ttf'),
    italics: mp('fonts/Roboto-Italic.ttf'),
    bolditalics: mp('fonts/Roboto-Italic.ttf')
  }
};

var Table = function (data) {

  var _body = [];

  if (!!data.title) {
    var _header = _.map(data.title, function (col) {
      return {
        text: col,
        style: ['tableHeader']
      }
    });
    _body.push(_header)
  }

  if (!!data.items) {
    _.each(data.items, function (row, rowIndex) {
      var _item = _.map(row, function (col, colIndex) {
        var _class = ['tableRow'];

        _class.push((rowIndex % 2 == 0) ? 'tableEven' : 'tableOdd');
        _class.push((colIndex == 0) ? 'tableFirstCol' : 'tableNotFirstCol');

        return {
          text: col,
          style: _class
        }

      });

      _body.push(_item)
    })
  }

  return {
    stack: [
      {
        text: data.caption
      },
      {
        style: 'tableExample',
        table: {
          widths: ['*', 100, 100],
          body: _body
        },
        layout: 'noBorders'
      }
    ]
  }
};

var pdfObj = new PdfWrapper(fonts);

var dataTable = [
  {
    caption: 'title title title title title title',
    title: ['Column 1', 'Column 2', 'Column 3'],
    items: [
      ['One value goes here', 'Another one here', 'OK?'],
      ['One value goes here One value goes here One value goes here One value goes here', 'Another one here', 'OK?'],
      ['One value goes here', 'Another one here', 'OK?']
    ]
  }
];

var pages = _.map(dataTable, function (_table) {
  return new Table(_table)
});

pdfObj.addContent({text: 'click me', style: ['linkStyle', {link: 'http://ilumy.com'}]});

_.each(pages, function (row) {
  pdfObj.addContent(row);
});


pdfObj.setStyles({
  linkStyle: {
    color: 'red'
  },
  tableExample: {
//    italics: true
  },
  tableHeader: {
    fillColor: 'black',
    color: 'white'
  },
  tableOdd: {

  },
  tableEven: {
    fillColor: '#f5f5f5'
  },
  tableNotFirstCol: {
    alignment: 'right'
  }
});

pdfObj.createPdf().printToFile(function (filename) {
  console.log(filename);
}, {saveToFile: 'tables.pdf'});
