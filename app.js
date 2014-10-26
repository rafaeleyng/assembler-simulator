var Format = function(format, instructions, components) {
  this.format = format;
  this.instructions = instructions;
  this.components = components;
  var componentsValues = {};
  for (var i in components) {
    var component = components[i];
    componentsValues[component] = ko.observable();
  }
  this.componentsValues = componentsValues;
}

var ViewModel = function() {

  var self = this;

  this.results = ko.observableArray();

  this.format = ko.observable();

  this.formats = [
    new Format(
      'R', 
      ['add', 'sub', 'and', 'or'],
      ['op', 'rs', 'rt', 'rd', 'shamt', 'funct']
    ),
    new Format(
      'I', 
      ['addi', 'andi', 'ori'],
      ['op', 'rs', 'rt', 'imm']
    ),
    new Format(
      'J', 
      ['j', 'jr'],
      ['op', 'addr']
    ),
  ];

  this.template = function() {
    return this.format().format;
  };

  this.formatLabel = function() {
    return this.format().format + '-Type';
  };

  this.enable = function() {
    var currentFormat = this.format();
    for (var i in currentFormat.components) {
      var componentValue = currentFormat.componentsValues[currentFormat.components[i]]();
      if (!componentValue) {
        return false;
      }
    }
    return true;
  };

  this.add = function() {
    var result = '';
    var components = this.format().components;
    for (var i in components) {
      var component = components[i];
      // result += this.format().componentsValues[component]() + ' ';
      result += parseInt(this.format().componentsValues[component]()).toString(2) + ' ';
    }
    this.results.push(result);
  };

  this.init = function() {
  };
  
  this.init();

};

ko.applyBindings(new ViewModel());