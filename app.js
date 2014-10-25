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

  this.result = ko.observable();

  this.format = ko.observable('J');

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

  // this.currentFormat = ko.computed(function() {
  //   for (var i in this.formats) {
  //     if (this.formats[i].format() === this.format) {
  //       return this.formats[i];
  //     }
  //   }
  // });

  console.log(this.formats);
  this.template = function() {
    return this.format().format;
  };

  this.formatLabel = function() {
    return this.format().format + '-Type';
  }
  this.visible = function(format) {
    return this.format().format === format;
  };

  this.add = function() {
    var result = '';
    var components = this.format().components;
    for (var i in components) {
      var component = components[i];
      result += this.format().componentsValues[component]() + ' ';
      // result += component + ' ';
    }
    this.result(result);
  };

  this.init = function() {
  };
  
  this.init();

};

ko.applyBindings(new ViewModel());