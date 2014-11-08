var app = app || {};

app.ViewModel = app.ViewModel || {};

var binToHex = function(binaryString) {
    var output = '';

    // For every 4 bits in the binary string
    for (var i=0; i < binaryString.length; i+=4)
    {
        // Grab a chunk of 4 bits
        var bytes = binaryString.substr(i, 4);

        // Convert to decimal then hexadecimal
        var decimal = parseInt(bytes, 2);
        var hex = decimal.toString(16);

        // Uppercase all the letters and append to output
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

  this.compileAssemblyStr = function(assemblyStr, resultsObj, index) {
    // debugger
    try {
      var lineResults = this.assembler.assemblyStrToAssemblyObjs(assemblyStr);
      // TODO resolver a duplicação de assemblyStr no for loop
      for (var i in lineResults) {
        var lineResult = lineResults[i];
        var compiledBinSpaced = this.assembler.compileAssemblyObj(lineResult.obj);      

        var compiledBin = compiledBinSpaced.replace(/ /g, '');
        
        console.log(lineResult.str);
        console.log(compiledBinSpaced);
        console.log(compiledBin);
        console.log(binToHex(compiledBin));

        resultsObj.assembly += lineResult.str + '\n';
        resultsObj.compiledBinSpaced += compiledBinSpaced + '\n';
        resultsObj.compiledBin += compiledBin + '\n';
        resultsObj.compiledHex += '0x' + binToHex(compiledBin) + '\n';
        resultsObj.signals += 'signals \n';
      }

    } catch (e) {
      throw '[line :0: \':1\'] :2'.replace(':0', index + 1).replace(':1', assemblyStr).replace(':2', e);
    }
  };

  this.compileFromText = function() {
    var text = this.textarea();

    if (!text || text === '') {
      throw 'Empty expression';
    }

    var results = {
      assembly: '',
      compiledBinSpaced: '',
      compiledBin: '',
      compiledHex: '',
      signals: '',
    };
    var lines = text.split('\n');
    for (var i in lines) {
      var assemblyStr = lines[i];
      this.compileAssemblyStr(assemblyStr, results, parseInt(i));
    }
    return results;
  };

  this.compileFromFields = function() {
    var results = {
      assembly: '',
      compiledBinSpaced: '',
      compiledBin: '',
      compiledHex: '',
      signals: '',
    };
    for (var i in this.instructions()) {      
      var assemblyStr = this.assembler.assemblyStrForInstruction(this.instructions()[i]);
      this.compileAssemblyStr(assemblyStr, results, parseInt(i));
    }
    return results;
  };

  this.compile = function() {
    this.cleanError();
    this.cleanResults();
    try {
      var results = this.selectedTab() === this.tabs.text ? this.compileFromText() : this.compileFromFields();
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