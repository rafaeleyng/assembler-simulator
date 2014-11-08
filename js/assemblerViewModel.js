var app = app || {};

app.ViewModel = app.ViewModel || {};

var binToHex = function(binaryString) {
    var output = '';
    for (var i=0; i < binaryString.length; i+=4)
    {
        var bytes = binaryString.substr(i, 4);
        var decimal = parseInt(bytes, 2);
        var hex = decimal.toString(16);
        output += hex.toUpperCase();
    }
    return output;      
};

app.ViewModel.Assembler = function(assembler) {

  var self = this;

  this.assembler = assembler;

  this.tabs = {
    text: 0,
    fields: 1,
  };

  this.compiled = {
    binSpaced: 0,
    bin: 1,
    hex: 2,
  };

  this.results = {
    assembly: ko.observable(''),
    compiledBinSpaced: ko.observable(''),
    compiledBin: ko.observable(''),
    compiledHex: ko.observable(''),
    signals: ko.observable(''),
  };

  this.error = ko.observable('');

  this.instructions = ko.observableArray();
  this.instructions.push(new app.Model.Instruction());
  this.operations = ko.observableArray(this.assembler.operations);
  this.textarea = ko.observable();

  this.compile = function() {
    this.cleanError();
    this.cleanResults();

    var results = {
      assembly: '',
      compiledBinSpaced: '',
      compiledBin: '',
      compiledHex: '',
      signals: '',
    };

    try {
      if (this.selectedTab() === this.tabs.text) {
        this.assembler.compileFromText(results, this.textarea());
      } else {
        this.assembler.compileFromFields(results, this.instructions());
      }

      this.results.assembly(results.assembly);
      this.results.compiledBinSpaced(results.compiledBinSpaced);
      this.results.compiledBin(results.compiledBin);
      this.results.compiledHex(results.compiledHex);
      this.results.signals(results.signals);

    } catch (e) {
      this.error(e);
    }
  };

  this.clickAdd = function(index) {
    this.instructions.splice(index + 1, 0, new app.Model.Instruction());
  };

  this.clickRemove = function(index) {
    this.instructions.splice(index, 1);
  };

  this.enableRemove = function() {
    return this.instructions().length !== 1;
  };

  this.cleanError = function() {
    this.error('');
  };

  this.cleanResults = function() {
    this.cleanError();    
    for (var i in this.results) {
      this.results[i]('');
    }
  };

  this.selectedCompiled = ko.observable(0);
  this.selectCompiled = function(compiled) {
    this.selectedCompiled(compiled);
  };
  this.isSelectedCompiled = function(compiled) {
    return this.selectedCompiled() === compiled;
  };

  this.compiledResult = ko.computed(function() {
    var results = self.results;
    var selectedCompiled = self.selectedCompiled();
    if (selectedCompiled === self.compiled.binSpaced) {
      return results.compiledBinSpaced();
    }
    if (selectedCompiled === self.compiled.bin) {
      return results.compiledBin();
    }
    if (selectedCompiled === self.compiled.hex) {
      return results.compiledHex();
    }
  });  

  // tabs
  this.selectedTab = ko.observable(0);
  this.selectTab = function(tab) {
    this.selectedTab(tab);
  };
  this.isSelectedTab = function(tab) {
    return this.selectedTab() === tab;
  };

  this.init = function() {

  };
  
  this.init();
};