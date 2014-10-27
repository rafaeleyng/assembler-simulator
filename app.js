var opcodes = {
  // R
  add:  '100000',
  sub:  '100010',
  and:  '100100',
  or:   '100101',

  // I
  addi: '001000',
  andi: '001100',
  ori:  '001101',

  // J
  j:    '000010',
  jr:   '001000',
};

var componentsBits = {
  rs: 5,
  rt: 5,
  rd: 5,
  shamt: 5,
  funct: 6,
  imm: 16,
  addr: 26,
};

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
};

String.prototype.padleft = function(len, chr) {
  var repeats = len - this.length;
  var pad = '';
  for (var i = 0; i < repeats; i++) {
    pad += chr;
  }
  return pad + this;
};

function getBinary(int, bits) {
  if (int>=0) {
    return int.toString(2).padleft(bits, "0");
  }
  return (-int-1).toString(2)
    .replace(/[01]/g, function(d){return +!+d;}) // hehe: inverts each char
    .padleft(bits, "1");
};

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
      if (component === 'op') {
        result += opcodes[this.format().componentsValues[component]()] + ' ';
      } else {
        result += getBinary(parseInt(this.format().componentsValues[component]()), componentsBits[component]) + ' ';
      }
    }
    this.results.push(result);
  };

  this.init = function() {
  };
  
  this.init();

};

ko.applyBindings(new ViewModel());