var app = app || {};

app.ViewModel = app.ViewModel || {};

app.ViewModel.Assembler = function(assembler) {

  var self = this;

  this.assembler = assembler;

  this.tabs = {
    text: 0,
    fields: 1,
  };

  this.results = {
    compiled: ko.observable(''),
    assembly: ko.observable(''),
    signals: ko.observable(''),
  };

  this.error = ko.observable('');

  this.instructions = ko.observableArray();
  this.instructions.push(new app.Model.Instruction());
  this.operations = ko.observableArray(this.assembler.operations);
  this.textarea = ko.observable();

  this.compileAssemblyStr = function(assemblyStr, resultsObj, index) {

    try {
      var assemblyObj = this.assembler.assemblyStrToAssemblyObj(assemblyStr);
      var compiled = this.assembler.compileAssemblyObj(assemblyObj);      
    } catch (e) {
      throw '[line :0: \':1\'] :2'.replace(':0', index + 1).replace(':1', assemblyStr).replace(':2', e);
    }

    console.log(assemblyStr);
    console.log(compiled);

    resultsObj.assembly += assemblyStr + '\n';
    resultsObj.compiled += compiled + '\n';
    resultsObj.signals += 'signals \n';    
  };

  this.compileFromText = function() {
    var text = this.textarea();

    if (!text || text === '') {
      throw 'Empty expression';
    }

    var results = {
      assembly: '',
      compiled: '',
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
      compiled: '',
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
      this.results.compiled(results.compiled);
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