/**
 * Created by finde on 16/03/15.
 */
'use strict';

var PdfWrapper = function (fonts) {

  var defaultClientFonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-Italic.ttf'
    }
  };

  var PdfPrinter = require('../printer');
  var fs = require('fs');
  var _ = require('lodash');

  var Document = function (docDefinition) {
    this.docDefinition = docDefinition;
    this.fonts = fonts || defaultClientFonts;
  };

  Document.prototype._createDoc = function (options, callback) {
    var printer = new PdfPrinter(this.fonts);

    var doc = printer.createPdfKitDocument(this.docDefinition, this.fonts, options);
    var chunks = [];
    var result;

    doc.on('data', function (chunk) {
      chunks.push(chunk);
    });
    doc.on('end', function () {
      result = Buffer.concat(chunks);
      callback(result);
    });
    doc.end();
  };

  Document.prototype.open = function (message) {
    // we have to open the window immediately and store the reference
    // otherwise popup blockers will stop us
    var win = window.open('', '_blank');

    try {
      this.getDataUrl(function (result) {
        win.location.href = result;
      });
    } catch (e) {
      win.close();
      return false;
    }
  };

//  Document.prototype.print = function () {
//    this.getDataUrl(function (dataUrl) {
//      var iFrame = document.createElement('iframe');
//      iFrame.style.position = 'absolute';
//      iFrame.style.left = '-99999px';
//      iFrame.src = dataUrl;
//      iFrame.onload = function () {
//        function removeIFrame() {
//          document.body.removeChild(iFrame);
//          document.removeEventListener('click', removeIFrame);
//        }
//
//        document.addEventListener('click', removeIFrame, false);
//      };
//
//      document.body.appendChild(iFrame);
//    }, { autoPrint: true });
//  };

//  Document.prototype.download = function (defaultFileName, cb) {
//    if (typeof defaultFileName === "function") {
//      cb = defaultFileName;
//      defaultFileName = null;
//    }
//
//    defaultFileName = defaultFileName || 'file.pdf';
//    this.getBuffer(function (result) {
//      saveAs(new Blob([result], {type: 'application/pdf'}), defaultFileName);
//      if (typeof cb === "function") {
//        cb();
//      }
//    });
//  };

  Document.prototype.getBase64 = function (cb, options) {
    if (!cb) {
      throw 'getBase64 is an async method and needs a callback argument';
    }

    this._createDoc(options, function (buffer) {
      cb(buffer.toString('base64'));
    });
  };

  Document.prototype.getDataUrl = function (cb, options) {
    if (!cb) {
      throw 'getDataUrl is an async method and needs a callback argument';
    }
    this._createDoc(options, function (buffer) {
      cb('data:application/pdf;base64,' + buffer.toString('base64'));
    });
  };

  Document.prototype.getBuffer = function (cb, options) {
    if (!cb) {
      throw 'getBuffer is an async method and needs a callback argument';
    }
    this._createDoc(options, cb);
  };

  Document.prototype.printToFile = function (cb, options) {
    if (!cb) {
      throw 'getBuffer is an async method and needs a callback argument';
    }
    this._createDoc(options, function (buffer) {
      var filename = options.saveToFile || _.uniqueId('pdf_');
      fs.writeFileSync(filename, buffer);
      return filename;
    });
  };


  var docDefinition = {
    content: [],
    styles: {},
    defaultStyle: {
      color: 'black'
    }
  };

  this.getJSON = function () {
    return postProcess();
  };

  this.addContent = function (content, isOverwrite) {
    if (!!isOverwrite) {
      docDefinition.content = content;
    } else {
      docDefinition.content.push(content)
    }
  };

  this.setFooter = function (footer) {
    docDefinition.footer = footer;
  };

  this.setStyles = function (styles, isOverride) {
    if (isOverride) {
      docDefinition.styles = styles;
    } else {
      docDefinition.styles = _.assign(docDefinition.styles, styles);
    }
  };

  var postProcess = function () {
    for (var i = 0; i < _.size(docDefinition.content); i++) {
      // convert to object if the type is string
      if (typeof docDefinition.content[i] == 'string') {
        docDefinition.content[i] = {
          text: docDefinition.content[i]
        }
      }
      docDefinition.content[i].pageBreak = 'after';
    }
    docDefinition.content[i - 1].pageBreak = null;
    return docDefinition;
  };

  this.createPdf = function () {
    return new Document(postProcess());
  };

  return this;
};

if (typeof module !== "undefined" && module !== null) {
  module.exports = PdfWrapper;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function () {
    return PdfWrapper;
  });
}
